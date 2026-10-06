import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useSection } from "../hooks/useSiteData";
import { block, fluid } from "../utils/design";
import PageHeading from "../components/ui/PageHeading";
import HeroBackdrop from "../components/ui/HeroBackdrop";
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

// Request for Proposal Form.docx: what is required, what is optional.
const REQUIRED = ["company", "contactPerson", "email", "phone", "service", "projectName", "location", "date", "scale", "budget", "brief", "consent"];
const TEXT_FIELDS = ["company", "contactPerson", "jobTitle", "email", "phone", "service", "projectName", "location", "date", "scale", "budget", "source", "brief"];
const BRIEF_MAX = 2000;

const INITIAL = Object.fromEntries([...TEXT_FIELDS.map((k) => [k, ""]), ["documents", []], ["consent", false], ["website", ""]]);

/** /contact — Request a Proposal (wp-admin → Proposal Requests). */
function Contact() {
  const { heading, intro, heroImage, form = {} } = useSection("contact");
  const f = form.fields || {};
  const label = (k) => f[k]?.label;

  const { values, setValue, errors, status, message, onSubmit } = useFormSubmit("proposal", INITIAL, {
    validate: (v) =>
      check(v, { required: REQUIRED, emails: ["email"] }, Object.fromEntries(TEXT_FIELDS.map((k) => [k, label(k)]))),
    build: (v) => {
      const data = new FormData();
      TEXT_FIELDS.forEach((k) => data.append(k, v[k].trim()));
      data.append("consent", v.consent ? "1" : "");
      v.documents.forEach((file) => data.append("documents[]", file));
      return data;
    },
  });

  useEffect(() => {
    document.title = "Request a Proposal - Samudra";
  }, []);

  const input = (name, extra = {}) => (
    <Field id={`f-${name}`} label={label(name)} required={REQUIRED.includes(name)} error={errors[name]} {...(extra.field || {})}>
      {extra.render ? (
        extra.render
      ) : (
        <TextInput
          id={`f-${name}`}
          name={name}
          value={values[name]}
          onChange={setValue}
          placeholder={f[name]?.placeholder}
          required={REQUIRED.includes(name)}
          error={errors[name]}
          {...(extra.input || {})}
        />
      )}
    </Field>
  );

  const select = (name, options) =>
    input(name, {
      render: (
        <SelectInput
          id={`f-${name}`}
          name={name}
          value={values[name]}
          onChange={setValue}
          placeholder={f[name]?.placeholder}
          options={options || []}
          required={REQUIRED.includes(name)}
          error={errors[name]}
        />
      ),
    });

  return (
    <Box sx={{ position: "relative", bgcolor: "brand.page", color: "common.white", pb: { xs: 8, md: fluid(57, 40) } }}>
      <HeroBackdrop image={heroImage} photoHeight={{ xs: 560, md: fluid(1270, 700) }} totalHeight={{ xs: 760, md: fluid(1783, 980) }} />

      <Box sx={{ position: "relative" }}>
        <Box sx={{ ...block(1532), pt: { xs: 14, md: fluid(305, 160) } }}>
          <PageHeading size={55}>{heading}</PageHeading>
          <Typography sx={{ mt: { xs: 2.5, md: fluid(26, 16) }, maxWidth: { md: fluid(570, 420) }, fontSize: { xs: 17, md: fluid(24, 16) }, lineHeight: 1.21 }}>
            {intro}
          </Typography>
        </Box>

        <Box sx={{ mt: { xs: 5, md: fluid(32, 24) } }}>
          {status === "sent" ? (
            <SuccessPanel title={form.successTitle} body={form.successBody} />
          ) : (
            <FormPanel>
              <Box component="form" noValidate onSubmit={onSubmit}>
                <Typography component="h2" sx={{ fontSize: { xs: 24, md: fluid(36, 22) }, fontWeight: 600 }}>
                  {form.sectionTitle}
                </Typography>
                <Box sx={{ mt: { xs: 3, md: fluid(44, 24) } }}>
                  <FieldGrid>
                    {input("company")}
                    {input("contactPerson")}
                    {input("jobTitle")}
                    {input("email", { input: { type: "email", autoComplete: "email" } })}
                    {input("phone", { input: { type: "tel", autoComplete: "tel" } })}
                    {select("service", form.serviceOptions)}
                    {input("projectName")}
                    {input("location")}
                    {input("date")}
                    {input("scale")}
                    {input("budget")}
                    {select("source", form.sourceOptions)}
                    {input("brief", {
                      field: { full: true },
                      render: (
                        <TextArea
                          id="f-brief"
                          name="brief"
                          value={values.brief}
                          onChange={setValue}
                          placeholder={f.brief?.placeholder}
                          maxLength={BRIEF_MAX}
                          required
                          error={errors.brief}
                        />
                      ),
                    })}
                    <Field id="f-documents" label={f.documents?.label} full>
                      <FileDropzone
                        id="f-documents"
                        files={values.documents}
                        onChange={(files) => setValue("documents", files)}
                        multiple
                        maxFiles={5}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        title={f.documents?.uploadTitle}
                        hint={f.documents?.uploadHint}
                        formats={f.documents?.uploadFormats}
                        error={errors.documents}
                      />
                    </Field>
                  </FieldGrid>
                </Box>

                <Box sx={{ mt: { xs: 4, md: fluid(44, 28) } }}>
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

                <Box sx={{ mt: { xs: 4, md: fluid(70, 32) } }}>
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

export default Contact;
