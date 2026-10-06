import { useRef, useState } from "react";
import { submitForm } from "../../services/wpApi";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True for an http(s) URL. */
export function isUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * State + submission for the two site forms. `validate(values)` returns
 * { field: message } for anything wrong; `build(values)` returns the
 * FormData to POST to /samudra/v1/forms/<kind>.
 */
export function useFormSubmit(kind, initial, { validate, build }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [message, setMessage] = useState("");
  // Seconds on the page are part of the server's bot check.
  const startedAt = useRef(Date.now());

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: "" } : e));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    const firstBad = Object.keys(found).find((k) => found[k]);
    if (firstBad) {
      setErrors(found);
      document.getElementById(`f-${firstBad}`)?.focus();
      return;
    }

    const data = build(values);
    data.append("website", values.website || "");
    data.append("elapsed", String(Math.round((Date.now() - startedAt.current) / 1000)));

    setStatus("sending");
    setMessage("");
    try {
      await submitForm(kind, data);
      setStatus("sent");
    } catch (err) {
      setErrors(err.fields || {});
      setMessage(err.message || "");
      setStatus("error");
    }
  };

  return { values, setValue, errors, status, message, onSubmit };
}

/** Required-field and format checks shared by both forms. */
export function check(values, { required = [], emails = [], urls = [] }, labels = {}) {
  const errors = {};
  for (const name of required) {
    const v = values[name];
    const empty = Array.isArray(v) ? v.length === 0 : typeof v === "boolean" ? !v : !String(v || "").trim();
    if (empty) errors[name] = name === "consent" ? "Please agree before sending." : `${labels[name] || "This field"} is required.`;
  }
  for (const name of emails) {
    if (!errors[name] && values[name] && !EMAIL.test(values[name].trim())) errors[name] = "Please enter a valid email address.";
  }
  for (const name of urls) {
    if (!errors[name] && values[name] && !isUrl(values[name].trim())) errors[name] = "Please enter a full link starting with https://";
  }
  return errors;
}
