
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Undo, Redo, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ToolbarProps {
    deviceMode: "desktop" | "mobile";
    setDeviceMode: (mode: "desktop" | "mobile") => void;
    onSave: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    isSaving: boolean;
}

export function Toolbar({
    deviceMode,
    setDeviceMode,
    onSave,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    isSaving
}: ToolbarProps) {
    return (
        <div className="h-14 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                <h1 className="font-semibold text-lg mr-4">Storefront Builder</h1>

                <div className="flex items-center bg-muted/50 rounded-md p-1 border">
                    <Button
                        variant={deviceMode === "desktop" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setDeviceMode("desktop")}
                    >
                        <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={deviceMode === "mobile" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setDeviceMode("mobile")}
                    >
                        <Smartphone className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onUndo}
                    disabled={!canUndo}
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRedo}
                    disabled={!canRedo}
                >
                    <Redo className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-2" />

                <Button onClick={onSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
