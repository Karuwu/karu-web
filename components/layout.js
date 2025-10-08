// components/Layout.js

export default function Layout({ children }) {
  return (
    <div>
      <header className="text-center mb-12">
        <nav className="mb-8">
          <div className="flex justify-center space-x-6">
            <a href="/" className="text-blue-600 hover:text-blue-800 font-medium"> Home</a>
            <span> //</span>
            <a href="/page" className="text-blue-600 hover:text-blue-800 font-medium"> Score List</a>
            <span> //</span>
            <a href="/taiko-insight" className="text-blue-600 hover:text-blue-800 font-medium"> Blog</a>
            <span> //</span>
            <a href="/test111" className="text-blue-600 hover:text-blue-800 font-medium"> Test</a>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
