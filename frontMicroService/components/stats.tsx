'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

interface StatItem {
  value: string;
  label: string;
  icon: string;
  color: string;
}

const stats: StatItem[] = [
  { value: '5+', label: 'Modules Actifs', icon: '📊', color: 'from-blue-500 to-cyan-500' },
  { value: '1000+', label: 'Établissements', icon: '🏢', color: 'from-cyan-500 to-teal-500' },
  { value: '100K+', label: 'Utilisateurs', icon: '👥', color: 'from-teal-500 to-green-500' },
  { value: '99.9%', label: 'Disponibilité', icon: '⚡', color: 'from-green-500 to-emerald-500' },
];

function CounterStat({ stat, inView }: { stat: StatItem; inView: boolean }) {
  const [count, setCount] = useState(0);
  const targetValue = parseInt(stat.value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (!inView) return;

    let current = 0;
    const increment = Math.ceil(targetValue / 50);
    const interval = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setCount(targetValue);
        clearInterval(interval);
      } else {
        setCount(current);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [inView, targetValue]);

  const displayValue = `${count}${stat.value.replace(/[0-9]/g, '')}`;

  return (
    <div className="text-center group">
      <div className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
        {displayValue}
      </div>
      <p className="text-gray-600 font-medium">{stat.label}</p>
      <div className="text-3xl mt-2">{stat.icon}</div>
    </div>
  );
}

export default function Stats() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>

      <div className="max-w-6xl mx-auto relative z-10">
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`transition-all duration-700 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="p-6 bg-white rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CounterStat stat={stat} inView={inView} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
