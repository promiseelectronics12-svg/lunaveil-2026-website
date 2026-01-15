import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlyingItem {
    id: string;
    imageUrl: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

interface FlyToCartContextType {
    triggerFly: (imageUrl: string, startElement: HTMLElement) => void;
    registerCartIcon: (element: HTMLElement | null) => void;
    isAnimating: boolean;
}

const FlyToCartContext = createContext<FlyToCartContextType | null>(null);

export function useFlyToCart() {
    const context = useContext(FlyToCartContext);
    if (!context) {
        throw new Error('useFlyToCart must be used within FlyToCartProvider');
    }
    return context;
}

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const cartIconRef = useRef<HTMLElement | null>(null);

    const registerCartIcon = useCallback((element: HTMLElement | null) => {
        cartIconRef.current = element;
    }, []);

    const triggerFly = useCallback((imageUrl: string, startElement: HTMLElement) => {
        if (!cartIconRef.current) {
            console.warn('Cart icon not registered');
            return;
        }

        const startRect = startElement.getBoundingClientRect();
        const endRect = cartIconRef.current.getBoundingClientRect();

        const newItem: FlyingItem = {
            id: `fly-${Date.now()}-${Math.random()}`,
            imageUrl,
            startX: startRect.left + startRect.width / 2,
            startY: startRect.top + startRect.height / 2,
            endX: endRect.left + endRect.width / 2,
            endY: endRect.top + endRect.height / 2,
        };

        setFlyingItems(prev => [...prev, newItem]);
        setIsAnimating(true);

        // Remove after animation
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
            setIsAnimating(false);
        }, 800);
    }, []);

    const handleAnimationComplete = (id: string) => {
        // Trigger cart bounce effect via custom event
        window.dispatchEvent(new CustomEvent('cartItemAdded'));
    };

    return (
        <FlyToCartContext.Provider value={{ triggerFly, registerCartIcon, isAnimating }}>
            {children}

            {/* Flying Items Portal */}
            <AnimatePresence>
                {flyingItems.map((item) => (
                    <motion.div
                        key={item.id}
                        className="fixed pointer-events-none z-[9999]"
                        initial={{
                            left: item.startX,
                            top: item.startY,
                            scale: 1,
                            opacity: 1,
                            x: '-50%',
                            y: '-50%',
                        }}
                        animate={{
                            left: item.endX,
                            top: item.endY,
                            scale: 0.2,
                            opacity: 0.8,
                            x: '-50%',
                            y: '-50%',
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0,
                        }}
                        transition={{
                            duration: 0.7,
                            ease: [0.25, 0.46, 0.45, 0.94], // Smooth arc
                        }}
                        onAnimationComplete={() => handleAnimationComplete(item.id)}
                    >
                        <div className="w-16 h-16 rounded-full overflow-hidden shadow-xl border-2 border-white bg-white">
                            <img
                                src={item.imageUrl}
                                alt="Flying item"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Trail effect */}
                        <motion.div
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400 to-pink-500"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </FlyToCartContext.Provider>
    );
}
