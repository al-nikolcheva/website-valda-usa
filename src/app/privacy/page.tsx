import type { Metadata } from "next";
import { Container } from "@/components/primitives";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Privacy and Cookie Policy",
  description: "How VALDA collects and uses personal data on valdagroup.com, the cookies we use, and the choices you have.",
  path: "/privacy",
});

const UPDATED = "October 14, 2026";

const SECTIONS: { h: string; p: string[]; ul?: string[] }[] = [
  {
    h: "Who we are",
    p: [
      `This website is run by ${SITE.legal} ("VALDA", "we"), a manufacturer of windows, doors and facades based in Bulgaria, European Union. For any privacy question, email ${SITE.email}.`,
    ],
  },
  {
    h: "What we collect",
    p: ["We collect only what we need to answer enquiries and understand who is interested in our systems:"],
    ul: [
      "Contact form: your name, email, company, phone and the project details you send us. These are emailed to our team through our email provider, Resend.",
      "Visitor analytics (only with your consent): if you accept cookies, we use Apollo.io to identify the company behind a visit, and for some US visitors the person, from your IP address and browser information, together with the pages viewed.",
      "Server logs: our host, Vercel, keeps standard technical logs (such as IP address and browser type) to run and secure the site.",
    ],
  },
  {
    h: "How we use it",
    p: [
      "We use this information to reply to your enquiry, prepare quotes, follow up on relevant projects and improve our website. We do not sell your personal data.",
      "Our legal bases are your consent (for analytics cookies), steps taken at your request before a contract (for enquiries and quotes), and our legitimate interest in running and securing our website.",
    ],
  },
  {
    h: "Cookies",
    p: [
      "The site works without any tracking cookies. Analytics cookies from Apollo.io are set only after you click Accept on our cookie banner. If you decline, they are not loaded.",
      "We store your choice in your browser so we don't ask again. You can change it at any time with the Cookie settings link in the footer or the button below.",
    ],
  },
  {
    h: "Who we share it with",
    p: [
      "We share data only with service providers that help us run the website and our sales process: Vercel (hosting), Resend (email delivery) and Apollo.io (visitor analytics, with your consent). Some of these providers are based in the United States and process data under appropriate safeguards such as Standard Contractual Clauses.",
    ],
  },
  {
    h: "How long we keep it",
    p: [
      "We keep enquiry emails for as long as needed to handle your project and for our business records, and analytics data for no longer than necessary for the purposes above.",
    ],
  },
  {
    h: "Your rights",
    p: [
      `You can ask us to access, correct, delete or export your personal data, object to or restrict its use, and withdraw consent at any time. Email ${SITE.email}. If you are in the EU, you can also complain to your local data protection authority; in Bulgaria this is the Commission for Personal Data Protection. California residents have the right to know, delete and opt out of the sale or sharing of personal information; declining cookies opts you out of Apollo tracking.`,
    ],
  },
  {
    h: "Changes",
    p: ["We may update this policy from time to time. The date at the top shows the latest version."],
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white pt-28 md:pt-36">
      <Container>
        <article className="mx-auto max-w-[680px] pb-28 md:pb-36">
          <p className="text-[14px] leading-[22px] text-mute">Last updated {UPDATED}</p>
          <h1 className="sw-h mt-6 text-[clamp(2.2rem,4.8vw,3.5rem)] leading-[1.08] text-char">Privacy and Cookie Policy</h1>
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="sw-h mt-14 text-[26px] text-char md:text-[28px]">{s.h}</h2>
              {s.p.map((t) => (
                <p key={t} className="mt-5 text-[17px] leading-[28px] text-char/80">{t}</p>
              ))}
              {s.ul && (
                <ul className="mt-5 space-y-3">
                  {s.ul.map((t) => (
                    <li key={t} className="flex gap-3 text-[17px] leading-[28px] text-char/80">
                      <span className="mt-[12px] h-1.5 w-1.5 shrink-0 rounded-full bg-mute" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <CookieSettingsButton className="mt-12 inline-flex h-[52px] items-center rounded-lg bg-char px-5 text-[14px] text-white transition-colors hover:bg-black" />
        </article>
      </Container>
    </div>
  );
}
