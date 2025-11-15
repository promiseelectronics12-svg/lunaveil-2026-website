import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import heroImage from "@assets/generated_images/Cosmetics_hero_lifestyle_image_3ccafea4.png";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 py-24">
        <div className="max-w-2xl">
          <h1 className="text-5xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover-elevate active-elevate-2 text-base px-8 backdrop-blur-sm"
            onClick={() => {
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="button-hero-cta"
          >
            {t("hero.cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
