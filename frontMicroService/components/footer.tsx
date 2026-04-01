'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Produit',
      links: [
        { label: 'Modules', href: '#' },
        { label: 'Tarification', href: '#' },
        { label: 'Documentation', href: '#' },
      ],
    },
    {
      title: 'Entreprise',
      links: [
        { label: 'À propos', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Carrières', href: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Centre d\'aide', href: '#' },
        { label: 'Nous contacter', href: '#' },
        { label: 'Statut du système', href: '#' },
      ],
    },
    {
      title: 'Légal',
      links: [
        { label: 'Politique de confidentialité', href: '#' },
        { label: 'Conditions d\'utilisation', href: '#' },
        { label: 'Cookies', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-blue-50 border-t border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-75" />
                <div className="relative bg-white px-3 py-2 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                EduManage
              </span>
            </Link>
            <p className="text-gray-600 text-sm">
              Gérez votre établissement d&apos;enseignement avec intelligence et simplicité.
            </p>
          </div>

          {/* Links Columns */}
          {footerLinks.map((column, idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-gray-900 mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-blue-100" />

        {/* Bottom Section */}
        <div className="py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © {currentYear} EduManage. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
              Twitter
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
              LinkedIn
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
