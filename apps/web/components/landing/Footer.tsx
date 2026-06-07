export function Footer() {
  return (
    <footer className="border-t border-white/8 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row">
        <div>
          <p className="text-xl font-bold">CraftSite AI</p>
          <p className="mt-2 max-w-sm text-sm text-white/45">
            AI-powered website builder for creators, developers and startups.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm text-white/50 md:grid-cols-4">
          <div>
            <p className="mb-3 font-semibold text-white">Product</p>
            <p>Features</p>
            <p className="mt-2">Templates</p>
            <p className="mt-2">Pricing</p>
          </div>
          <div>
            <p className="mb-3 font-semibold text-white">Company</p>
            <p>About</p>
            <p className="mt-2">Contact</p>
            <p className="mt-2">Careers</p>
          </div>
          <div>
            <p className="mb-3 font-semibold text-white">Resources</p>
            <p>Docs</p>
            <p className="mt-2">Examples</p>
            <p className="mt-2">Blog</p>
          </div>
          <div>
            <p className="mb-3 font-semibold text-white">Social</p>
            <p>GitHub</p>
            <p className="mt-2">Twitter</p>
            <p className="mt-2">LinkedIn</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
