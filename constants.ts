import { Field, Stage, Week, Note } from './types';

export const FIELDS: Field[] = [
  { 
    id: 'stat', 
    title: 'Temel İstatistik', 
    description: 'Veri analizi ve istatistiksel modellemenin temelleri.', 
    iconName: 'BarChart',
    color: 'sky'
  },
  { 
    id: 'psych', 
    title: 'Psikometri', 
    description: 'Ölçüm teorisi ve ölçek geliştirme teknikleri.', 
    iconName: 'LineChart',
    color: 'orange'
  },
  { 
    id: 'panel', 
    title: 'Panel Veri', 
    description: 'Zaman serileri ve kesitsel veri analizleri.', 
    iconName: 'Database',
    color: 'lime'
  },
  { 
    id: 'social', 
    title: 'Hesaplamalı Sosyal Bilimler', 
    description: 'Büyük veri ile sosyal olguların incelenmesi.', 
    iconName: 'Users',
    color: 'indigo'
  },
  { 
    id: 'digital', 
    title: 'Dijital Beşeri Bilimler', 
    description: 'Metin madenciliği ve kültürel analitik.', 
    iconName: 'Code',
    color: 'fuchsia'
  },
  { 
    id: 'ai', 
    title: 'Yapay Zeka', 
    description: 'Makine öğrenimi ve derin öğrenme uygulamaları.', 
    iconName: 'Brain',
    color: 'rose'
  },
];

export const STAGES: Stage[] = [
  { id: 'stage1', title: '1. Aşama: İstatistiğe Giriş' },
  { id: 'stage2', title: '2. Aşama: Kodlamaya Giriş' },
  { id: 'stage3', title: '3. Aşama: Modül Dersleri' },
];

// Helper to generate weeks dynamically based on the selected Stage
export const generateWeeks = (stageId: string | null = 'stage1'): Week[] => {
  const weeks: Week[] = [];
  
  // Determine start date and duration based on stage
  let startStr = '2025-10-08'; // Default Stage 1
  let count = 8;

  if (stageId === 'stage2') {
    startStr = '2025-12-03'; // Around Dec 4th (Wednesday)
    count = 5;
  } else if (stageId === 'stage3') {
    startStr = '2026-02-04'; // Feb 4th
    count = 14;
  }

  let current = new Date(startStr);

  for (let i = 0; i < count; i++) {
    const start = new Date(current);
    const end = new Date(current);
    end.setDate(end.getDate() + 6);

    weeks.push({
      id: `week${i + 1}`,
      title: `${i + 1}. Hafta`,
      startDate: start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      endDate: end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    });

    // Move to next week
    current.setDate(current.getDate() + 7);
  }
  return weeks;
};

// Initial Mock Data
export const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    author: 'Ali Yılmaz',
    content: 'Temel istatistikte p-value değerinin yanlış yorumlanması üzerine konuştuk. H0 hipotezini reddetmek için %5 sınırının kesin bir doğru olmadığını anladım.',
    date: new Date().toISOString(),
    fieldId: 'stat',
    stageId: 'stage1',
    weekId: 'week1'
  },
  {
    id: '2',
    author: 'Ayşe Demir',
    content: 'Python Pandas kütüphanesinde groupby fonksiyonu ile pivot table oluşturmak Excel\'den çok daha hızlı. Özellikle büyük verisetlerinde loc ve iloc farkını iyi kavramak lazım.',
    date: new Date(Date.now() - 86400000).toISOString(), 
    fieldId: 'stat',
    stageId: 'stage2',
    weekId: 'week1'
  },
  {
    id: '3',
    author: 'Mehmet Can',
    content: 'Yapay sinir ağlarında backpropagation algoritmasının matematiksel türevini inceledik. Zincir kuralının (chain rule) burada nasıl işlediği kritik.',
    date: new Date(Date.now() - 172800000).toISOString(), 
    fieldId: 'ai',
    stageId: 'stage3',
    weekId: 'week1'
  }
];