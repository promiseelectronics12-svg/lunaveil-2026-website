import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Globe, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useState, useEffect } from "react";

interface MobileMenuProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
    const { language, setLanguage, t } = useLanguage();
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark";
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                    {/* Language Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Globe className="h-4 w-4" /> Language
                        </h3>
                        <div className="flex gap-2">
                            <Button
                                variant={language === "en" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setLanguage("en")}
                            >
                                English
                            </Button>
                            <Button
                                variant={language === "bn" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setLanguage("bn")}
                            >
                                বাংলা
                            </Button>
                        </div>
                    </div>

                    {/* Theme Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            Appearance
                        </h3>
                        <div className="flex gap-2">
                            <Button
                                variant={theme === "light" ? "default" : "outline"}
                                className="flex-1"
                                onClick={toggleTheme}
                            >
                                Light
                            </Button>
                            <Button
                                variant={theme === "dark" ? "default" : "outline"}
                                className="flex-1"
                                onClick={toggleTheme}
                            >
                                Dark
                            </Button>
                        </div>
                    </div>

                    {/* Admin Link */}
                    <div className="pt-6 border-t">
                        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                            <a href="/login">
                                <ShieldCheck className="h-4 w-4" />
                                Admin Panel
                            </a>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
