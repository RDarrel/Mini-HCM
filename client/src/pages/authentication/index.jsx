import { useEffect, useMemo, useState } from "react";
import Logo from "../../assets/logos/kitchenette.jpg";
import BG1 from "../../assets/backgrounds/bg1.png";
import BG2 from "../../assets/backgrounds/bg2.png";
import BG3 from "../../assets/backgrounds/bg3.png";
import BG4 from "../../assets/backgrounds/bg4.png";
import LoginForm from "./login";
import SignupForm from "./sign-up";
import "./index.css";

const Authentication = () => {
  const slides = useMemo(
    () => [
      {
        src: BG1,
        kicker: "Sandy’s Kitchenette",
        title: "Freshly prepared meals • Dine-in & Takeout",
        subtitle:
          "Enjoy comfort food made fresh—perfect for quick meals, family dinners, and take-home cravings.",
      },
      {
        src: BG2,
        kicker: "We offer",
        title: "Catering • Custom packages for events",
        subtitle:
          "Planning a celebration or meeting? We can cater with flexible packages and menu options to match your occasion.",
      },
      {
        src: BG3,
        kicker: "We offer",
        title: "Event venue reservations • Celebrate with us",
        subtitle:
          "Reserve a space for birthdays, gatherings, and special moments—easy scheduling with a cozy venue feel.",
      },
      {
        src: BG4,
        kicker: "Good food, good moments",
        title: "Dine • Cater • Celebrate",
        subtitle:
          "Discover what Sandy’s Kitchenette has for you—great food, catering support, and a venue for memorable events.",
      },
    ],
    [],
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(Boolean(media.matches));
    apply();

    if (media.addEventListener) {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }

    media.addListener(apply);
    return () => media.removeListener(apply);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    slides.forEach((s) => {
      const img = new Image();
      img.src = s.src;
    });
  }, [slides]);

  useEffect(() => {
    if (reduceMotion) return;
    if (!isPageVisible) return;
    if (isFormFocused) return;

    const id = window.setInterval(() => {
      setActiveSlide((idx) => (idx + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(id);
  }, [isFormFocused, isPageVisible, reduceMotion, slides.length]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisibility = () =>
      setIsPageVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4  p-6 md:p-10">
        <div className="flex justify-center items-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-10 items-center justify-center text-primary-foreground rounded-full">
              <img
                src={Logo}
                alt="Sandy’s Kitchenette"
                className="h-10 w-10 rounded-full"
              />
            </div>
            Cornerstone Information Technology.
          </a>
        </div>
        <div
          className="flex flex-1 items-center justify-center"
          onFocusCapture={() => setIsFormFocused(true)}
          onBlurCapture={() => setIsFormFocused(false)}
        >
          <div className="w-full max-w-lg">
            {isLogin ? (
              <LoginForm setIsLogin={setIsLogin} />
            ) : (
              <SignupForm setIsLogin={setIsLogin} />
            )}
          </div>
        </div>
      </div>

      <div
        className={[
          "auth-hero relative hidden bg-muted lg:block overflow-hidden",
          reduceMotion ? "reduce-motion" : "",
        ].join(" ")}
      >
        {slides.map((slide, idx) => (
          <div
            key={`${idx}-${slide.src}`}
            className={[
              "auth-hero-slide",
              idx === activeSlide ? "is-active" : "",
            ].join(" ")}
            aria-hidden={idx !== activeSlide}
          >
            <img
              src={slide.src}
              alt={slide.title}
              className="auth-hero-img h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              loading={idx === 0 ? "eager" : "lazy"}
            />

            <div className="auth-hero-overlay">
              <div className="auth-hero-card">
                <p className="auth-hero-kicker">
                  <span className="auth-hero-blurline">{slide.kicker}</span>
                </p>
                <h2 className="auth-hero-title">
                  <span className="auth-hero-blurline">{slide.title}</span>
                </h2>
                {slide.subtitle ? (
                  <p className="auth-hero-subtitle">
                    <span className="auth-hero-blurline">{slide.subtitle}</span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Authentication;
