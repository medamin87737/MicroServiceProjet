'use client';

import { useInView } from 'react-intersection-observer';
import { Users, UserCheck, Building2, BookMarked, DoorOpen } from 'lucide-react';

const featureCards = [
  {
    id: 'students',
    icon: Users,
    title: 'Gestion des Étudiants',
    description: 'Gérez complètement vos étudiants: ajouter, modifier, consulter leurs informations.',
    features: [
      'Ajouter et modifier les étudiants',
      'Consulter la liste complète',
      'Visualiser les détails individuels',
    ],
    gradient: 'from-blue-500 to-blue-600',
    color: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'teachers',
    icon: UserCheck,
    title: 'Gestion des Enseignants',
    description: 'Organisez vos ressources humaines et les informations professionnelles.',
    features: [
      'Gestion des enseignants',
      'Informations professionnelles',
      'Attribution des classes',
    ],
    gradient: 'from-cyan-500 to-cyan-600',
    color: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  {
    id: 'classes',
    icon: Building2,
    title: 'Gestion des Classes',
    description: 'Organisez vos classes selon le niveau, la filière et l\'année académique.',
    features: [
      'Créer et organiser les classes',
      'Gestion par niveau et filière',
      'Association d\'étudiants et enseignants',
    ],
    gradient: 'from-teal-500 to-teal-600',
    color: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  {
    id: 'subjects',
    icon: BookMarked,
    title: 'Gestion des Matières',
    description: 'Gérez l\'ensemble des matières enseignées et leurs caractéristiques.',
    features: [
      'Créer des matières',
      'Définir les caractéristiques pédagogiques',
      'Association avec les classes',
    ],
    gradient: 'from-green-500 to-green-600',
    color: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'rooms',
    icon: DoorOpen,
    title: 'Gestion des Salles',
    description: 'Organisez et gérez vos salles de cours pour une planification optimale.',
    features: [
      'Ajouter et modifier les salles',
      'Gérer la capacité et ressources',
      'Planning des salles',
    ],
    gradient: 'from-orange-500 to-orange-600',
    color: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
];

function FeatureCard({ card }: { card: (typeof featureCards)[0] }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const Icon = card.icon;

  return (
    <div
      ref={ref}
      className={`group h-full transition-all duration-500 transform ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div
        className={`h-full p-6 rounded-xl border-2 ${card.borderColor} ${card.color} hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden`}
      >
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />

        <div className="flex items-start gap-4 mb-4">
          <div
            className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-1">{card.title}</h3>
        </div>

        <p className="text-gray-600 mb-4 text-sm">{card.description}</p>

        <ul className="space-y-2">
          {card.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br ${card.gradient} text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Features() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Les 5 Modules Essentiels
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une solution complète avec 5 modules microservices pour gérer tous les aspects de votre établissement d&apos;enseignement.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card, idx) => (
            <div key={idx} style={{ transitionDelay: `${idx * 100}ms` }}>
              <FeatureCard card={card} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
