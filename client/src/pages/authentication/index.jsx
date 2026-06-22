import { useState } from "react";
import Logo from "../../assets/logos/hcm.png";
import BG1 from "../../assets/backgrounds/bg1.png";
import LoginForm from "./login";
import SignupForm from "./sign-up";
import "./index.css";

const Authentication = () => {
  const slide = {
    src: BG1,
    kicker: "Human Capital Management",
    title: "Workforce Management Made Simple",
    subtitle:
      "Manage attendance, employee records, schedules, and workforce insights in one centralized platform.",
  };

  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center items-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-10 items-center justify-center text-primary-foreground rounded-full">
              <img
                src={Logo}
                alt="Mini HCM Logo"
                className="h-10 w-10 rounded-full"
              />
            </div>
            Cornerstone Information Technology.
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className={`w-full max-w-${isLogin ? "sm" : "lg"}`}>
            {isLogin ? (
              <LoginForm setIsLogin={setIsLogin} />
            ) : (
              <SignupForm setIsLogin={setIsLogin} />
            )}
          </div>
        </div>
      </div>

      <div className="auth-hero relative hidden bg-muted lg:block overflow-hidden">
        <div className="auth-hero-slide is-active" aria-hidden={false}>
          <img
            src={slide.src}
            alt={slide.title}
            className="auth-hero-img h-full w-full object-cover brightness-75"
            loading="eager"
          />

          <div className="auth-hero-overlay">
            <div className="auth-hero-card">
              <p className="auth-hero-kicker">
                <span className="auth-hero-blurline">{slide.kicker}</span>
              </p>
              <h2 className="auth-hero-title">
                <span className="auth-hero-blurline">{slide.title}</span>
              </h2>
              <p className="auth-hero-subtitle">
                <span className="auth-hero-blurline">{slide.subtitle}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
