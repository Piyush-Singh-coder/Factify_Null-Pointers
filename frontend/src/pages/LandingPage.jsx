import { Bot, CheckCircle, MessageSquare, ShieldCheck, User } from "lucide-react";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { themes } from "../theme";
import { PricingTable, SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { useThemeStore } from "../store/useThemeStore";

const LandingPage = ({ onLaunchApp }) => {

  const {theme,setTheme} = useThemeStore();
  
  const navigate = useNavigate();

  const {isSignedIn} = useUser();

  const handleSubmit = () => {
    if (isSignedIn){
        navigate('/ai');
    }else{
        navigate('/sign-in')
    }
  }

  // Feature Card
  const FeatureCard = ({ icon, title, children }) => (
    <div className="card bg-base-100 shadow-xl border border-base-300 p-6 rounded-2xl">
      <div className="w-14 h-14 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-base-content mb-2">{title}</h3>
      <p className="text-base-content/70">{children}</p>
    </div>
  );

  // User Card
  const UserCard = ({ title, children }) => (
    <div className="card bg-base-200 border border-base-300 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      <p className="text-base-content/70">{children}</p>
    </div>
  );

  // Pricing Tier
  const PricingTier = ({
    title,
    price,
    description,
    features,
    isFeatured = false,
  }) => (
    <div
      className={`card p-8 bg-base-100 rounded-2xl shadow-xl border 
        ${isFeatured ? "border-primary" : "border-base-300"} relative`}
    >
      {isFeatured && (
        <span className="badge badge-primary badge-lg absolute -top-3 left-1/2 -translate-x-1/2 shadow-md">
          Most Popular
        </span>
      )}

      <h3 className="text-2xl font-bold text-base-content">{title}</h3>
      <p className="text-4xl font-extrabold text-base-content mt-4">
        {price}
        {price !== "Free" && (
          <span className="text-base font-normal text-base-content/60">/mo</span>
        )}
      </p>

      <p className="text-base-content/70 mt-4 mb-6">{description}</p>

      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-base-content/70">
            <CheckCircle className="w-5 h-5 text-success shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onLaunchApp}
        variant={isFeatured ? "primary" : "secondary"}
        size="lg"
        className="w-full"
      >
        Get Started
      </Button>
    </div>
  );

  return (
    <div className="bg-base-100 text-base-content font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full py-4 z-20">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">Factify AI</span>
          </div>

          <select
            className="select select-primary select-sm"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {themes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
           <SignedOut>
            <SignInButton />
           </SignedOut>
           <SignedIn>
            <UserButton />
           </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 text-center">
        {/* background blobs */}
        <div className="absolute inset-0 bg-linear-to-b from-base-100 to-primary/5 -z-10" />
        <div className="absolute -top-24 -left-24 w-1/2 h-1/2 bg-primary/20 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="absolute -bottom-24 -right-24 w-1/2 h-1/2 bg-secondary/20 rounded-full blur-3xl opacity-20 -z-10" />

        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-base-content mb-6">
            Instantly Verify Videos, shorts, Reels and{" "}
            <span className="text-primary">other video format content</span>
          </h1>

          <p className="text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto mb-10">
            Our AI platform fact-checks video claims in seconds and provides you reason and transcript.
          </p>

          <div className="flex flex-wrap justify-center gap-4">

            
            <Button onClick={handleSubmit} size="lg">
              Launch Application
            </Button>
           
            
            <Button variant="ghost" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-base-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Intelligence Tools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6" />}
              title="AI Video Fact-Checker"
            >
              Paste any video URL and get an instant AI-powered analysis of its
              factual claims, powered by GPT-4o and Whisper.
            </FeatureCard>

            <FeatureCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="AI Content Verify"
            >
              Paste facts, information or content and get an instant AI-powered analysis of its
              factual claims.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for Thinkers and Doers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <UserCard title="General Consumers & Social Media Users">
              Anyone who sees a video on platforms like YouTube, X (Twitter), or Facebook and wants a quick "second opinion" to check if the claims are true before they believe or share them.
            </UserCard>

            <UserCard title="Journalists & Fact-Checkers">
                Professionals who need to rapidly assess the veracity of video clips as a first step in their research, saving them time on manual transcription and analysis.
            </UserCard>

            <UserCard title="Students & Educators">
              Individuals using online videos for research or in a curriculum. They can use this tool to validate that the information in lectures, documentaries, or tutorials is factually accurate.
            </UserCard>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-base-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Choose Your Plan
          </h2>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingTier
              title="Basic"
              price="Free"
              description="Perfect for individuals and hobbyists."
              features={[
                "5 Video Verifications/day",
                "1 RAG Session",
                "10 File Uploads",
                "Community Support",
              ]}
            />

            <PricingTier
              title="Pro"
              price="$15"
              isFeatured
              description="For professionals and teams needing scale."
              features={[
                "Unlimited Video Verifications",
                "Unlimited RAG Sessions",
                "Up to 1,000 File Uploads",
                "Priority Support",
                "API Access (Coming Soon)",
              ]}
            />
            
          </div> */}
          <PricingTable />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-base-100 border-t border-base-200">
        <div className="text-center text-base-content/60">
          &copy; {new Date().getFullYear()} Factify AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
