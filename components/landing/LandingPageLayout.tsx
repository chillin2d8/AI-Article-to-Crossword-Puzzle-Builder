import React, { useState } from 'react';
import { USER_TIERS, APP_CONFIG } from '../../config';
import { UserTierConfig } from '../../types';

interface LandingPageLayoutProps {
  heroContent?: React.ReactNode;
  children?: React.ReactNode;
  footerContent?: React.ReactNode; 
  onStartAuth: () => void;
  pageType: 'landing' | 'legal';
}

const TierCard: React.FC<{ tier: UserTierConfig; onSelect: () => void, isFeatured: boolean }> = React.memo(({ tier, onSelect, isFeatured }) => (
    <div className={`p-8 rounded-2xl border flex flex-col ${isFeatured ? 'bg-slate-900 text-white border-slate-700' : 'bg-white border-slate-200'}`}>
        <h3 className="text-lg font-semibold">{tier.name}</h3>
        <p className={`mt-2 h-12 ${isFeatured ? 'text-slate-400' : 'text-slate-500'}`}>{tier.features[0]}</p>
        <p className="mt-6 text-4xl font-bold tracking-tight">
            {tier.price}
            <span className={`text-sm font-semibold leading-6 tracking-normal ${isFeatured ? 'text-slate-400' : 'text-slate-500'}`}>{tier.frequency}</span>
        </p>
        <button
            onClick={onSelect}
            className={`mt-8 block w-full rounded-md py-2 text-center text-sm font-semibold leading-6 ${isFeatured ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
        >
            Get Started
        </button>
        <ul className={`mt-8 space-y-3 text-sm leading-6 flex-grow ${isFeatured ? 'text-slate-300' : 'text-slate-600'}`}>
            {tier.features.slice(1).map((feature) => {
                const isNew = feature.startsWith('NEW:');
                const featureText = isNew ? feature.substring(4).trim() : feature;
                const underlineParts = featureText.split('__');

                return (
                    <li key={feature} className="flex gap-x-3">
                        <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                        </svg>
                        {isNew ? (
                            <span className="font-semibold">
                                <span className={`font-bold ${isFeatured ? 'text-yellow-400' : 'text-amber-500'} animate-pulse mr-1`}>NEW:</span>
                                {underlineParts.length > 1 ? (
                                    <>
                                        {underlineParts[0]}
                                        <span className="underline">{underlineParts[1]}</span>
                                        {underlineParts[2]}
                                    </>
                                ) : (
                                    featureText
                                )}
                            </span>
                        ) : (
                            feature
                        )}
                    </li>
                );
            })}
        </ul>
    </div>
));

export const LandingPageLayout: React.FC<LandingPageLayoutProps> = React.memo(({ heroContent, children, footerContent, onStartAuth, pageType }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;
    
    if (pageType === 'landing') {
        const targetId = href.substring(1); // remove '#'
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        // For legal pages, navigate back to the main page anchor
        window.location.href = href;
    }
  };
  
  const handleDonationClick = () => {
    window.open(APP_CONFIG.DONATION_LINK_URL, '_blank', 'noopener,noreferrer');
  }

  const NavLink: React.FC<{section: string; text: string; isSemibold?: boolean;}> = ({ section, text, isSemibold }) => {
      const href = pageType === 'legal' ? `/#${section}` : `#${section}`;
      return (
        <a href={href} onClick={handleNavLinkClick} className={`text-slate-600 hover:text-indigo-600 ${isSemibold ? 'font-semibold' : ''}`}>
            {text}
        </a>
      );
  };
  
  const MobileNavLink: React.FC<{section: string; text: string; isSemibold?: boolean;}> = ({ section, text, isSemibold }) => {
    const href = pageType === 'legal' ? `/#${section}` : `#${section}`;
    return (
      <a href={href} onClick={handleNavLinkClick} className={`text-slate-600 hover:text-indigo-600 text-lg ${isSemibold ? 'font-semibold' : ''}`}>
          {text}
      </a>
    );
  };

  return (
    <div className="bg-slate-50 text-slate-800">
      <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-20 shadow-sm">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
              <a href={pageType === 'legal' ? '/' : '#top'} onClick={handleNavLinkClick} className="text-2xl font-bold text-slate-900">PLAY ⚡</a>
              
              <div className="hidden md:flex items-center space-x-6">
                  <NavLink section="features" text="Features" />
                  <NavLink section="about" text="About" />
                  <NavLink section="pricing" text="Pricing" />
                  <NavLink section="contact" text="Contact" />
                  <button onClick={handleDonationClick} className="text-slate-600 hover:text-indigo-600 font-semibold">Donate</button>
              </div>
              <div className="hidden md:block">
                <button onClick={onStartAuth} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700">
                    Login
                </button>
              </div>

              <div className="md:hidden">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                      </svg>
                  </button>
              </div>
          </nav>

          {isMenuOpen && (
              <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-10 animate-fade-in">
                  <div className="flex flex-col items-center space-y-4 p-6">
                      <MobileNavLink section="features" text="Features" />
                      <MobileNavLink section="about" text="About" />
                      <MobileNavLink section="pricing" text="Pricing" />
                      <MobileNavLink section="contact" text="Contact" />
                      <button onClick={handleDonationClick} className="text-slate-600 hover:text-indigo-600 font-semibold text-lg">Donate</button>
                      <button onClick={() => { setIsMenuOpen(false); onStartAuth(); }} className="mt-4 w-full px-5 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700">
                          Login
                      </button>
                  </div>
              </div>
          )}
      </header>

      <main id="top">
        {heroContent}
        {children}

        {pageType === 'landing' && (
            <>
                <section id="features" className="py-20 px-6">
                    <div className="container mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-slate-900">It's as easy as 1-2-3</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-10 text-center">
                            <div>
                                <h3 className="text-2xl font-semibold mb-2">1. Paste Any Text or URL</h3>
                                <p className="text-slate-600">Grab a dense history chapter, a complex science article, or a current events story. Our AI instantly reads and understands it.</p>
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold mb-2">2. Customize Your Lesson</h3>
                                <p className="text-slate-600">Select the target reading level, puzzle type, and number of words to perfectly match your curriculum needs.</p>
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold mb-2">3. Generate & Go!</h3>
                                <p className="text-slate-600">In under a minute, our AI delivers a complete, multi-page activity packet, including a summary, images, and a custom puzzle.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="py-20 px-6 bg-white">
                    <div className="container mx-auto max-w-4xl text-center">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Story: A Spark in the Silence</h2>
                        <div className="text-left text-slate-600 space-y-4">
                            <p>For just a moment, imagine a classroom where the silence is heavier than any textbook. A room in a juvenile detention center, where hope is a scarce resource. This is where the idea for PLAY was born.</p>
                            <p>The founder is a friend of a teacher faced with bright, capable students trapped behind walls of circumstance. She saw a desperate need. Traditional worksheets were met with vacant stares. Dry text couldn't compete with the noise of their past. How could she reach them? How could she unlock the potential she knew was there?</p>
                            <p>From this simple, powerful need, <strong>PLAY (Puzzle Learning Aids for Youth)</strong> was created. It was built on the belief that for some kids, learning isn't just about knowledge—it's a lifeline. It's a way to reconnect, to build confidence, to see a future beyond the present.</p>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="py-20 px-6">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-slate-900">Plans for every classroom and educator</h2>
                            <p className="mt-4 text-lg text-slate-600">For less than the price of a cup of coffee, you can unlock powerful features to create amazing learning materials.</p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <TierCard tier={USER_TIERS.Free} onSelect={onStartAuth} isFeatured={false} />
                            <TierCard tier={USER_TIERS.Monthly} onSelect={onStartAuth} isFeatured={true} />
                            <TierCard tier={USER_TIERS.Yearly} onSelect={onStartAuth} isFeatured={false} />
                        </div>
                    </div>
                </section>
                
                <section id="contact" className="py-20 px-6 bg-white border-t">
                    <div className="container mx-auto text-center">
                        <h2 className="text-4xl font-bold text-slate-900 mb-8">Get In Touch</h2>
                        <div className="text-slate-600 text-lg">
                            <p>Have questions? We'd love to hear from you!</p>
                            <p className="mt-2 font-semibold">info@play-app.app</p>
                            <p className="mt-1">PO Box 1234, Naples, FL 34119</p>
                        </div>
                    </div>
                </section>
            </>
        )}
      </main>
      
      <footer className="bg-slate-900 text-slate-400 py-8 px-6">
          <div className="container mx-auto text-center text-sm">
             <p className="mb-4">
                Love PLAY? Consider supporting its development.{' '}
                <a 
                  href={APP_CONFIG.DONATION_LINK_URL} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  Buy me a coffee
                </a>.
              </p>
             <p>&copy; {new Date().getFullYear()} PLAY-App.app. All Rights Reserved.</p>
             <div className="mt-2">
                 <a href="/privacy" className="hover:underline">Privacy Policy</a>
                 <span className="mx-2">&bull;</span>
                 <a href="/terms" className="hover:underline">Terms of Service</a>
             </div>
             {footerContent}
          </div>
      </footer>
    </div>
  );
});