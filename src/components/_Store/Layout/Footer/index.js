import Link from "@/components/Ui/Link";
import Logo from "@/svgs/Logo";
import { getSocialIcon } from "./getSocialIcon";
import NewsletterCta from "../../Newsletter";

export default function Footer({ footer }) {
  if (!footer) return null;

  console.log("Footer data:", footer);

  return (
    <>
      <NewsletterCta />
      <footer className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Logo className="w-48"/>

              {footer.footerDescription && (
                <p className="mt-4 text-sm text-gray-500 max-w-xs">
                  {footer.footerDescription}
                </p>
              )}

              {footer.socialLinks?.length > 0 && (
                <div className="flex gap-3 mt-6">
                  {footer.socialLinks.map((s, i) => (
                    <Link
                      key={i}
                      href={s.url}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                    >
                      {getSocialIcon(s.icon)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <FooterColumn
              title={footer.aboutLinksTitle}
              links={footer.aboutLinks}
            />

            {/* Information */}
            <FooterColumn
              title={footer.informationTitle}
              links={footer.informationLinks}
            />

            {/* Policy */}
            <FooterColumn
              title={footer.policyTitle}
              links={footer.policyLinks}
            />
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          {footer.copyrights}
        </div>
      </footer>
    </>
  );
}

/* -----------------------------------------
   Column helper
------------------------------------------ */
function FooterColumn({ title, links }) {
  if (!title || !links?.length) return null;

  return (
    <div>
      <h4 className="font-medium mb-4">{title}</h4>
      <ul className="space-y-3 text-sm text-gray-600">
        {links.map((l, i) => (
          <li key={i}>
            <Link href={l.url} className="hover:text-neutral-900 transition">
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
