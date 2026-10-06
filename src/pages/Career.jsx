import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useSection } from "../hooks/useSiteData";
import { fetchCareerPositions } from "../services/wpApi";
import { block, fluid } from "../utils/design";
import PageHeading from "../components/ui/PageHeading";
import HeroBackdrop from "../components/ui/HeroBackdrop";
import CareerCard from "../components/career/CareerCard";
import {
  Consent,
  Field,
  FieldGrid,
  FileDropzone,
  FormPanel,
  Honeypot,
  SelectInput,
  SubmitButton,
  SuccessPanel,
  TextArea,
  TextInput,
} from "../components/forms/FormParts";
import { check, useFormSubmit } from "../components/forms/useFormSubmit";

// Career Application Form.docx: what is required, what is optional.
const REQUIRED = ["firstName", "lastName", "email", "phone", "position", "location", "resume", "consent"];
const TEXT_FIELDS = ["firstName", "lastName", "email", "phone", "position", "location", "jobTitle", "experience", "linkedin", "portfolioUrl", "motivation"];
const MOTIVATION_MAX = 1000;
const DOCS = ".pdf,.doc,.docx";

const INITIAL = Object.fromEntries([...TEXT_FIELDS.map((k) => [k, ""]), ["resume", []], ["portfolioFile", []], ["consent", false], ["website", ""]]);

/** /career — open positions (wp-admin → Career) and the application form (→ Applications). */
function Career() {
  const { heading, heroImage, emptyText, applyLabel, closesLabel, form = {} } = useSection("career");
  const f = form.fields || {};
  const label = (k) => f[k]?.label;
  const [jobs, setJobs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    document.title = form.documentTitle ? `${form.documentTitle} - Samudra` : "Career - Samudra";
  }, [form.documentTitle]);

  useEffect(() => {
    fetchCareerPositions()
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoaded(true));
  }, []);

  const positions = [...jobs.map((j) => j.title), form.generalApplicationLabel].filter(Boolean);

  const { values, setValue, errors, status, message, onSubmit } = useFormSubmit("application", INITIAL, {
    validate: (v) =>
      check(
        v,
        { required: REQUIRED, emails: ["email"], urls: ["linkedin", "portfolioUrl"] },
        { ...Object.fromEntries(TEXT_FIELDS.map((k) => [k, label(k)])), resume: label("resume") },
      ),
    build: (v) => {
      const data = new FormData();
      TEXT_FIELDS.forEach((k) => data.append(k, v[k].trim()));
      data.append("consent", v.consent ? "1" : "");
      v.resume.forEach((file) => data.append("resume", file));
      v.portfolioFile.forEach((file) => data.append("portfolioFile", file));
      return data;
    },
  });

  const apply = (job) => {
    setValue("position", job.title);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const input = (name, inputProps = {}) => (
    <Field id={`f-${name}`} label={label(name)} required={REQUIRED.includes(name)} error={errors[name]}>
      <TextInput
        id={`f-${name}`}
        name={name}
        value={values[name]}
        onChange={setValue}
        placeholder={f[name]?.placeholder}
        required={REQUIRED.includes(name)}
        error={errors[name]}
        {...inputProps}
      />
    </Field>
  );

  const upload = (name) => (
    <Field id={`f-${name}`} label={label(name)} required={REQUIRED.includes(name)} error={null}>
      <FileDropzone
        id={`f-${name}`}
        files={values[name]}
        onChange={(files) => setValue(name, files)}
        accept={DOCS}
        title={f[name]?.uploadTitle}
        formats={f[name]?.uploadFormats}
        error={errors[name]}
      />
    </Field>
  );

  return (
    <Box sx={{ position: "relative", bgcolor: "brand.page", color: "common.white", pb: { xs: 8, md: fluid(37, 32) } }}>
      <HeroBackdrop image={heroImage} photoHeight={{ xs: 560, md: fluid(1270, 700) }} totalHeight={{ xs: 760, md: fluid(1783, 980) }} />

      <Box sx={{ position: "relative" }}>
        {/* ── Current openings ─────────────────────────────────── */}
        <Box sx={{ ...block(1532), pt: { xs: 14, md: fluid(305, 160) } }}>
          <PageHeading size={55}>{heading}</PageHeading>
        </Box>
        <Box sx={{ mt: { xs: 5, md: fluid(80, 40) }, display: "grid", rowGap: { xs: 3, md: fluid(48, 28) } }}>
          {loaded && !jobs.length && (
            <Typography sx={{ ...block(1532), fontSize: { xs: 17, md: fluid(21, 16) }, opacity: 0.85 }}>{emptyText}</Typography>
          )}
          {jobs.map((job) => (
            <CareerCard key={job.id} job={job} applyLabel={applyLabel} closesLabel={closesLabel} onApply={apply} />
          ))}
        </Box>

        {/* ── Application form ─────────────────────────────────── */}
        <Box ref={formRef} sx={{ ...block(1532), pt: { xs: 10, md: fluid(170, 90) }, scrollMarginTop: { xs: 60, md: fluid(120, 90) } }}>
          <PageHeading component="h2" size={55}>
            {form.heading}
          </PageHeading>
          {form.intro && (
            <Typography sx={{ mt: { xs: 2.5, md: fluid(26, 16) }, maxWidth: { md: fluid(900, 560) }, fontSize: { xs: 17, md: fluid(24, 16) }, lineHeight: 1.21 }}>
              {form.intro}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: { xs: 5, md: fluid(34, 24) } }}>
          {status === "sent" ? (
            <SuccessPanel title={form.successTitle} body={form.successBody} />
          ) : (
            <FormPanel sx={{ pt: { xs: 4, md: fluid(42, 28) } }}>
              <Box component="form" noValidate onSubmit={onSubmit}>
                <FieldGrid>
                  {input("firstName", { autoComplete: "given-name" })}
                  {input("lastName", { autoComplete: "family-name" })}
                  {input("email", { type: "email", autoComplete: "email" })}
                  {input("phone", { type: "tel", autoComplete: "tel" })}
                  <Field id="f-position" label={label("position")} required error={errors.position}>
                    <SelectInput
                      id="f-position"
                      name="position"
                      value={values.position}
                      onChange={setValue}
                      placeholder={f.position?.placeholder}
                      options={positions}
                      required
                      error={errors.position}
                    />
                  </Field>
                  {input("location")}
                  {input("jobTitle", { autoComplete: "organization-title" })}
                  {input("experience", { inputMode: "numeric" })}
                  {input("linkedin", { type: "url" })}
                  {input("portfolioUrl", { type: "url" })}
                  <Field id="f-motivation" label={label("motivation")} error={errors.motivation} full>
                    <TextArea
                      id="f-motivation"
                      name="motivation"
                      value={values.motivation}
                      onChange={setValue}
                      placeholder={f.motivation?.placeholder}
                      maxLength={MOTIVATION_MAX}
                      error={errors.motivation}
                    />
                  </Field>
                  {upload("resume")}
                  {upload("portfolioFile")}
                </FieldGrid>

                <Box sx={{ mt: { xs: 4, md: fluid(36, 24) } }}>
                  <Consent
                    id="f-consent"
                    checked={values.consent}
                    onChange={(v) => setValue("consent", v)}
                    text={form.consent}
                    linkLabel={form.privacyLinkLabel}
                    error={errors.consent}
                  />
                </Box>

                <Honeypot value={values.website} onChange={(v) => setValue("website", v)} />

                {status === "error" && (
                  <Typography role="alert" sx={{ mt: 3, color: "#FF6B70", fontSize: { xs: 15, md: fluid(18, 14) } }}>
                    {message || form.errorText}
                  </Typography>
                )}

                <Box sx={{ mt: { xs: 4, md: fluid(32, 24) } }}>
                  <SubmitButton label={form.submitLabel} loading={status === "sending"} />
                </Box>
              </Box>
            </FormPanel>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Career;
