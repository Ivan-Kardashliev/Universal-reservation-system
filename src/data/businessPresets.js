/**
 * УНИВЕРСАЛЕН КОНФИГУРАЦИОНЕН МОДЕЛ ЗА РАЗЛИЧНИ БИЗНЕСИ
 * 
 * Този файл доказва универсалността на архитектурата:
 * Системата не е закодирана твърдо (hardcoded) за един тип бизнес,
 * а се настройва изцяло динамично чрез този обект!
 */

export const BUSINESS_PRESETS = {
  medical: {
    id: 'medical',
    name: 'Медицински център',
    categoryName: 'Здравеопазване и клиники',
    tagline: 'Индивидуални прегледи при водещи специалисти с фиксирани 30-минутни слотове',
    badge: 'Кабинети и Лекари',
    icon: 'Stethoscope',
    theme: {
      primary: 'emerald',
      accentColor: '#059669',
      bgColor: 'bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      ringColor: 'focus:ring-emerald-500'
    },
    workingHours: {
      start: '08:30',
      end: '17:30',
      slotDurationMinutes: 30,
      breakTime: {
        start: '12:30',
        end: '13:30',
        label: 'Обедна почивка'
      }
    },
    // Капацитет по подразбиране: 1 пациент на лекар
    defaultCapacity: 1,
    allowPartySize: false, // Само 1 човек на резервация
    categories: ['Всички', 'Кардиология', 'Педиатрия', 'Стоматология', 'Дерматология'],
    serviceOptions: [
      'Първичен медицински преглед',
      'Вторичен / контролен преглед',
      'Профилактична консултация',
      'Ехография / диагностика',
      'Издаване на медицинско направление'
    ],
    resources: [
      {
        id: 'med_1',
        name: 'Д-р Калоян Петров',
        title: 'Кардиолог',
        category: 'Кардиология',
        room: 'Кабинет 102',
        capacity: 1,
        experience: '16 год. стаж',
        avatarBg: 'bg-emerald-100 text-emerald-700',
        description: 'Специалист по артериална хипертония, ЕКГ и ехокардиография.'
      },
      {
        id: 'med_2',
        name: 'Д-р Елена Георгиева',
        title: 'Специалист педиатър',
        category: 'Педиатрия',
        room: 'Кабинет 108',
        capacity: 1,
        experience: '12 год. стаж',
        avatarBg: 'bg-teal-100 text-teal-700',
        description: 'Детски болести, профилактични прегледи и ваксинационни консултации.'
      },
      {
        id: 'med_3',
        name: 'Д-р Мартин Димитров',
        title: 'Лекар по дентална медицина',
        category: 'Стоматология',
        room: 'Стоматологичен кабинет 3',
        capacity: 1,
        experience: '9 год. стаж',
        avatarBg: 'bg-cyan-100 text-cyan-700',
        description: 'Терапевтична стоматология, пломби и почистване на зъбен камък.'
      },
      {
        id: 'med_4',
        name: 'Д-р Десислава Стоянова',
        title: 'Дерматолог',
        category: 'Дерматология',
        room: 'Кабинет 205',
        capacity: 1,
        experience: '14 год. стаж',
        avatarBg: 'bg-green-100 text-green-700',
        description: 'Диагностика на кожни проблеми, дерматоскопия и естетични процедури.'
      }
    ]
  },

  beauty: {
    id: 'beauty',
    name: 'Студио за красота',
    categoryName: 'Салони и СПА услуги',
    tagline: 'Персонализирани разкрасителни процедури със слотове по 45 минути',
    badge: 'Стилисти и СПА',
    icon: 'Sparkles',
    theme: {
      primary: 'rose',
      accentColor: '#e11d48',
      bgColor: 'bg-rose-50',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white',
      ringColor: 'focus:ring-rose-500'
    },
    workingHours: {
      start: '09:00',
      end: '18:45',
      slotDurationMinutes: 45,
      breakTime: {
        start: '13:30',
        end: '14:15',
        label: 'Техническа пауза'
      }
    },
    defaultCapacity: 1,
    allowPartySize: false,
    categories: ['Всички', 'Фризьорство', 'Маникюр', 'Барбър', 'Козметика'],
    serviceOptions: [
      'Дамско подстригване и сешоар',
      'Балеаж и боядисване',
      'Маникюр с гел лак и декорация',
      'Мъжко подстригване и оформяне на брада',
      'Хидратираща терапия за лице'
    ],
    resources: [
      {
        id: 'sal_1',
        name: 'Виктория Иванова',
        title: 'Топ фризьор',
        category: 'Фризьорство',
        room: 'Фризьорско място #1',
        capacity: 1,
        experience: '8 год. опит',
        avatarBg: 'bg-pink-100 text-pink-700',
        description: 'Модерни подстригвания, сложни техники на боядисване и терапия за коса.'
      },
      {
        id: 'sal_2',
        name: 'Мая Тодорова',
        title: 'Маникюрист',
        category: 'Маникюр',
        room: 'Маникюрна маса #2',
        capacity: 1,
        experience: '6 год. опит',
        avatarBg: 'bg-rose-100 text-rose-700',
        description: 'Апаратен маникюр, изграждане с гел и прецизна японска техника.'
      },
      {
        id: 'sal_3',
        name: 'Александър Попов',
        title: 'Бръснар и стилист',
        category: 'Барбър',
        room: 'Барбър зона - Стол #1',
        capacity: 1,
        experience: '7 год. опит',
        avatarBg: 'bg-amber-100 text-amber-800',
        description: 'Класически и модерни мъжки прически, бръснене.'
      },
      {
        id: 'sal_4',
        name: 'Силвия Василева',
        title: 'Медицински козметик',
        category: 'Козметика',
        room: 'Кабинет за терапии',
        capacity: 1,
        experience: '10 год. опит',
        avatarBg: 'bg-purple-100 text-purple-700',
        description: 'Ултразвуково почистване, anti-age процедури и масаж на лице.'
      }
    ]
  },

  sports_events: {
    id: 'sports_events',
    name: 'Спорт, зали и наем на ресурси',
    categoryName: 'Спорт, зали и наем на ресурси',
    tagline: 'Кортове, спортни зали с капацитет за групови тренировки и конферентни зали',
    badge: 'Спортни събития и наем на зали',
    icon: 'Trophy',
    theme: {
      primary: 'indigo',
      accentColor: '#4f46e5',
      bgColor: 'bg-indigo-50',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      buttonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      ringColor: 'focus:ring-indigo-500'
    },
    workingHours: {
      start: '08:00',
      end: '21:00',
      slotDurationMinutes: 60,
      breakTime: null // Без обедна пауза, непрекъснат режим
    },
    defaultCapacity: 1,
    // ДЕМОНСТРАЦИЯ НА СПОДЕЛЕН КАПАЦИТЕТ:
    // Позволява посочване на брой места / участници при резервация!
    allowPartySize: true,
    categories: ['Всички', 'Тенис корт', 'Групови тренировки', 'Събития и семинари'],
    serviceOptions: [
      'Свободна игра / тренировка',
      'Групово посещение с треньор',
      'Корпоративно събитие / тиймбилдинг',
      'Обучение / конференция',
      'Турнирен мач'
    ],
    resources: [
      {
        id: 'spo_1',
        name: 'Тенис корт #1 ',
        title: 'Тенис корт на открито с червена настилка',
        category: 'Тенис корт',
        room: 'Сектор А',
        capacity: 1, // 1 резервация за целия корт (до 4 играчи)
        capacityLabel: '1 резервация (до 4 играчи)',
        experience: 'Професионална настилка',
        avatarBg: 'bg-orange-100 text-orange-700',
        description: 'Червена настилка с LED осветление за вечерни часове.'
      },
      {
        id: 'spo_2',
        name: 'Тенис корт #2',
        title: 'Бърз корт с акрилно покритие',
        category: 'Тенис корт',
        room: 'Сектор B',
        capacity: 1,
        capacityLabel: '1 резервация (до 4 играчи)',
        experience: 'US Open стандарт',
        avatarBg: 'bg-blue-100 text-blue-700',
        description: 'Отличен за динамичен тенис с перфектен отскок на топката.'
      },
      {
        id: 'spo_3',
        name: 'Зала за групови тренировки',
        title: 'Зала за групови тренировки',
        category: 'Групови тренировки',
        room: 'Зала 201 (Етаж 2)',
        capacity: 12, // СПОДЕЛЕН КАПАЦИТЕТ: До 12 души в един и същи час!
        capacityLabel: 'Капацитет: 12 участници',
        experience: 'Професионално оборудване',
        avatarBg: 'bg-emerald-100 text-emerald-800',
        description: ''
      },
      {
        id: 'spo_4',
        name: 'Конферентна зала',
        title: 'Мултифункционална зала за събития',
        category: 'Събития и семинари',
        room: 'Централно фоайе',
        capacity: 25, // СПОДЕЛЕН КАПАЦИТЕТ: До 25 участници
        capacityLabel: 'Капацитет: 25 места',
        experience: '4K лазерен проектор',
        avatarBg: 'bg-indigo-100 text-indigo-700',
        description: 'Оборудвана с мултимедия, озвучаване, високоскоростен Wi-Fi и конферентни маси.'
      }
    ]
  }
};
