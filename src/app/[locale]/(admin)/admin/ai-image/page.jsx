// File: app/[locale]/admin/product-image-gen/page.js
// Main page container for AI Product Image Generator (JavaScript)

import { useTranslations } from "next-intl";
import { WizardProvider } from "@/components/_Admin/ProductImageGen/WizardContext";

import StepLayout from "@/components/_Admin/ProductImageGen/StepLayout";
import StepBagType from "@/components/_Admin/ProductImageGen/steps/StepBagType";
import StepOccasion from "@/components/_Admin/ProductImageGen/steps/StepOccasion";
import StepModel from "@/components/_Admin/ProductImageGen/steps/StepModel";
import StepUpload from "@/components/_Admin/ProductImageGen/steps/StepUpload";
import StepProductDetails from "@/components/_Admin/ProductImageGen/steps/StepProductDetails";
import StepPerspectives from "@/components/_Admin/ProductImageGen/steps/StepPerspectives";
import StepReview from "@/components/_Admin/ProductImageGen/steps/StepReview";

export default function ProductImageGenPage() {
  const t = useTranslations("aiImageGen");

  return (
    <WizardProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {t("app.title")}
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-10">
          <StepLayout
            steps={[
              <StepBagType key="bag" />,
              <StepOccasion key="occasion" />,
              <StepProductDetails key="details" />,
              <StepPerspectives key="perspectives" />,
              <StepReview key="review" />
            ]}
          />
        </main>
      </div>
    </WizardProvider>
  );
}
