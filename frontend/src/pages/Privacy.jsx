import React from "react";
import { PageHeader } from "../ui/components";
import { AnalyticsChoice } from "../ui/analytics";
import { siteConfig } from "../ui/metadata";
import { privacySections } from "../privacy";
export default function Privacy() {
  return (
    <>
      <PageHeader
        eyebrow="VOS INFORMATIONS"
        title="Politique de confidentialité"
      >
        Comprendre l’utilisation de vos données et garder le choix.
      </PageHeader>
      <article className="panel legal-page">
        {!siteConfig.policyReviewed && (
          <div className="policy-draft" role="note">
            <strong>
              Document de travail — à compléter avant mise en production
            </strong>
            <p>
              L’identité de l’exploitant, son contact, l’hébergement, les bases
              juridiques et les durées de conservation doivent être précisés et
              validés pour le service effectivement exploité.
            </p>
          </div>
        )}
        <AnalyticsChoice />
        {privacySections(siteConfig).map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}
        {siteConfig.email && (
          <a className="button secondary" href={`mailto:${siteConfig.email}`}>
            Contacter l’équipe confidentialité
          </a>
        )}
      </article>
    </>
  );
}
