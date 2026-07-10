import { BuilderProject, BuilderSection } from "@craftsite/shared";

export function compileBuilderToReact(builderData: BuilderProject): string {
  const sectionsHtml = builderData.sections
    .filter((s: BuilderSection) => s.visible)
    .sort((a: BuilderSection, b: BuilderSection) => a.order - b.order)
    .map((s: BuilderSection) => compileSection(s, builderData.theme))
    .join("\n\n");

  const { theme } = builderData;
  const themeClasses = `bg-[${theme.backgroundColor}] text-[${theme.textColor}] font-sans`;

  return `import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function GeneratedWebsite() {
  return (
    <div className="min-h-screen ${themeClasses}">
${sectionsHtml}
    </div>
  );
}
`;
}

function compileSection(section: BuilderSection, theme: any): string {
  switch (section.type) {
    case "navbar":
      return compileNavbar(section, theme);
    case "hero":
      return compileHero(section, theme);
    case "features":
      return compileFeatures(section, theme);
    case "pricing":
      return compilePricing(section, theme);
    case "cta":
      return compileCTA(section, theme);
    case "footer":
      return compileFooter(section, theme);
    default:
      return `      {/* Section ${section.type} not fully implemented in compiler yet */}`;
  }
}

function getStylesClasses(styles?: any) {
  if (!styles) return "";
  const classes = [];
  if (styles.backgroundColor) classes.push(`bg-[${styles.backgroundColor}]`);
  if (styles.textColor) classes.push(`text-[${styles.textColor}]`);
  if (styles.paddingTop) classes.push(`pt-${styles.paddingTop}`);
  if (styles.paddingBottom) classes.push(`pb-${styles.paddingBottom}`);
  if (styles.alignment) classes.push(`text-${styles.alignment}`);
  return classes.join(" ");
}

function compileNavbar(section: BuilderSection, theme: any) {
  const { logoText = "Brand", links = [] } = section.props;
  const navLinks = links.map((l: any) => `<a href="${l.href || '#'}" className="text-sm font-medium hover:text-[${theme.accentColor}] transition-colors">${l.label}</a>`).join("\n          ");
  
  return `      <nav className="border-b bg-[${theme.backgroundColor}]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl">{String("${logoText}")}</div>
          <div className="hidden md:flex gap-6">
            ${navLinks}
          </div>
          <Button variant="default" className="bg-[${theme.primaryColor}] hover:bg-[${theme.primaryColor}]/90 text-white">Get Started</Button>
        </div>
      </nav>`;
}

function compileHero(section: BuilderSection, theme: any) {
  const { badge = "", heading = "Welcome", description = "", primaryCta = "Get Started", secondaryCta = "" } = section.props;
  const alignClass = getStylesClasses(section.styles) || "text-center";
  return `      <section className="py-24 container mx-auto px-4 flex flex-col items-center justify-center ${alignClass}">
        ${badge ? `<div className="mb-6 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">${badge}</div>` : ""}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl">${heading}</h1>
        <p className="text-lg md:text-xl text-[${theme.mutedTextColor}] mb-8 max-w-2xl">${description}</p>
        <div className="flex gap-4">
          <Button size="lg" className="bg-[${theme.primaryColor}] hover:bg-[${theme.primaryColor}]/90 text-white">${primaryCta}</Button>
          ${secondaryCta ? `<Button size="lg" variant="outline">${secondaryCta}</Button>` : ""}
        </div>
      </section>`;
}

function compileFeatures(section: BuilderSection, theme: any) {
  const { title = "Features", description = "", items = [] } = section.props;
  const itemsHtml = items.map((item: any) => `
            <Card className="bg-[${theme.backgroundColor}] border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-[${theme.primaryColor}]/10 flex items-center justify-center mb-4 text-[${theme.primaryColor}]">
                  {/* Icon ${item.icon} placeholder */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">${item.title}</h3>
                <p className="text-[${theme.mutedTextColor}]">${item.description}</p>
              </CardContent>
            </Card>`).join("");
            
  return `      <section className="py-24 bg-[${theme.secondaryColor}]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">${title}</h2>
            <p className="text-lg text-[${theme.mutedTextColor}] max-w-2xl mx-auto">${description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
${itemsHtml}
          </div>
        </div>
      </section>`;
}

function compilePricing(section: BuilderSection, theme: any) {
  const { title = "Pricing", description = "", plans = [] } = section.props;
  const plansHtml = plans.map((plan: any) => `
            <Card className="${plan.popular ? `border-[${theme.primaryColor}] border-2 relative scale-105` : 'border'}">
              ${plan.popular ? `<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[${theme.primaryColor}] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>` : ''}
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">${plan.name}</h3>
                <div className="text-4xl font-extrabold mb-6">${plan.price}<span className="text-lg font-normal text-[${theme.mutedTextColor}]">/mo</span></div>
                <ul className="space-y-4 mb-8">
                  ${(plan.features || []).map((f: string) => `<li className="flex items-center gap-2"><svg className="text-green-500 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ${f}</li>`).join('')}
                </ul>
                <Button className="w-full ${plan.popular ? `bg-[${theme.primaryColor}] hover:bg-[${theme.primaryColor}]/90 text-white` : ''}" variant="${plan.popular ? 'default' : 'outline'}">${plan.cta || 'Select Plan'}</Button>
              </CardContent>
            </Card>`).join("");

  return `      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">${title}</h2>
            <p className="text-lg text-[${theme.mutedTextColor}] max-w-2xl mx-auto">${description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
${plansHtml}
          </div>
        </div>
      </section>`;
}

function compileCTA(section: BuilderSection, theme: any) {
  const { title = "Ready to start?", description = "", buttonText = "Get Started" } = section.props;
  return `      <section className="py-24 bg-[${theme.primaryColor}] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">${title}</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">${description}</p>
          <Button size="lg" className="bg-white text-[${theme.primaryColor}] hover:bg-gray-100">${buttonText}</Button>
        </div>
      </section>`;
}

function compileFooter(section: BuilderSection, theme: any) {
  const { brand = "Brand", description = "", columns = [], copyright = "© 2026 Brand. All rights reserved." } = section.props;
  
  const columnsHtml = columns.map((col: any) => `
            <div>
              <h4 className="font-bold mb-4">${col.title}</h4>
              <ul className="space-y-2">
                ${(col.links || []).map((l: any) => `<li><a href="${l.href || '#'}" className="text-[${theme.mutedTextColor}] hover:text-[${theme.primaryColor}] transition-colors">${l.label}</a></li>`).join('')}
              </ul>
            </div>`).join("");

  return `      <footer className="py-12 border-t bg-[${theme.backgroundColor}]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="font-bold text-xl mb-4">${brand}</div>
              <p className="text-[${theme.mutedTextColor}]">${description}</p>
            </div>
${columnsHtml}
          </div>
          <div className="pt-8 border-t text-center text-[${theme.mutedTextColor}]">
            ${copyright}
          </div>
        </div>
      </footer>`;
}
