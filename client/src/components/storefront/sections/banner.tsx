import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Promotion } from "@shared/schema";

interface BannerSectionProps {
    content: {
        text?: string;
        link?: string;
        backgroundColor?: string;
        textColor?: string;
        usePromotion?: boolean;
    };
}

export function BannerSection({ content }: BannerSectionProps) {
    const { t } = useLanguage();

    const { data: activePromotions = [] } = useQuery<Promotion[]>({
        queryKey: ["/api/promotions/active"],
        queryFn: () => apiRequest("GET", "/api/promotions/active"),
        enabled: content.usePromotion || !content.text,
    });

    const promotionText = (content.usePromotion && activePromotions.length > 0)
        ? (activePromotions[0].description || activePromotions[0].name)
        : (content.text || (activePromotions.length > 0 && !content.text ? (activePromotions[0].description || activePromotions[0].name) : t("banner.welcome")));

    return (
        <div
            className="w-full py-3 px-4 text-center text-sm font-medium"
            style={{
                backgroundColor: content.backgroundColor || "#000",
                color: content.textColor || "#fff"
            }}
        >
            {content.link ? (
                <Link href={content.link} className="inline-flex items-center hover:underline justify-center gap-2">
                    {promotionText}
                    <ArrowRight className="h-4 w-4" />
                </Link>
            ) : (
                <span>{promotionText}</span>
            )}
        </div>
    );
}
