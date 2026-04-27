export interface TimeSeriesPoint {
	date: Date;
	value: number;
}

export interface CategoryPoint {
	label: string;
	value: number;
}

export interface KpiMetric {
	title: string;
	value: string;
	unit: string;
	change: number;
	subtitle: string;
}

export interface MonthlyPatientData {
	date: Date;
	stays: number;         // total hospital stays (also aliased as value)
	value: number;         // = stays, for TimeSeriesPoint compatibility
	lvcCount: number;      // stays that had an LVC procedure
	lvcProportion: number; // lvcCount / stays * 100
	breakdown: {
		age: CategoryPoint[];
		sex: CategoryPoint[];
		insurance: CategoryPoint[];
		resuscitation: CategoryPoint[];
		medications: CategoryPoint[];
		comorbidities: CategoryPoint[];
	};
}

function p(n: number, base: number, wave: number, i: number): number {
	return Math.max(1, Math.round((n * base) / 100 + Math.sin(i * wave) * 3));
}

function makeBreakdown(n: number, i: number): MonthlyPatientData['breakdown'] {
	return {
		age: [
			{ label: '<40',   value: p(n, 10, 1.1, i) },
			{ label: '40–60', value: p(n, 22, 1.3, i) },
			{ label: '60–80', value: p(n, 42, 0.9, i) },
			{ label: '>80',   value: p(n, 26, 1.5, i) }
		],
		sex: [
			{ label: 'Male',   value: p(n, 52, 0.7, i) },
			{ label: 'Female', value: p(n, 48, 0.7, i) }
		],
		insurance: [
			{ label: 'Public',  value: p(n, 58, 1.2, i) },
			{ label: 'Private', value: p(n, 32, 1.1, i) },
			{ label: 'None',    value: p(n, 10, 0.8, i) }
		],
		resuscitation: [
			{ label: 'Full Code', value: p(n, 42, 1.0, i) },
			{ label: 'DNR',       value: p(n, 35, 1.2, i) },
			{ label: 'DNI',       value: p(n, 14, 0.9, i) },
			{ label: 'Comfort',   value: p(n,  9, 1.3, i) }
		],
		medications: [
			{ label: '0–2',  value: p(n,  8, 1.1, i) },
			{ label: '3–5',  value: p(n, 24, 0.8, i) },
			{ label: '6–10', value: p(n, 43, 1.0, i) },
			{ label: '>10',  value: p(n, 25, 1.2, i) }
		],
		comorbidities: [
			{ label: '0',   value: p(n,  5, 1.4, i) },
			{ label: '1–2', value: p(n, 27, 1.0, i) },
			{ label: '3–4', value: p(n, 40, 0.9, i) },
			{ label: '5+',  value: p(n, 28, 1.1, i) }
		]
	};
}

const monthDates = [
	'2025-05-01', '2025-06-01', '2025-07-01', '2025-08-01',
	'2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01',
	'2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01'
];

// ── LVC 1 ── Benzodiazepines / sedativa-hypnotics in older adults
// ~12% proportion, slight downward trend (improvement over time)
const lvc1Raw = [
	{ stays: 312, lvcCount: 38 },
	{ stays: 298, lvcCount: 35 },
	{ stays: 334, lvcCount: 41 },
	{ stays: 321, lvcCount: 42 },
	{ stays: 308, lvcCount: 37 },
	{ stays: 345, lvcCount: 48 },
	{ stays: 367, lvcCount: 44 },
	{ stays: 389, lvcCount: 43 },
	{ stays: 301, lvcCount: 36 },
	{ stays: 278, lvcCount: 31 },
	{ stays: 312, lvcCount: 37 },
	{ stays: 334, lvcCount: 39 }
];

export const patientTimeSeries: MonthlyPatientData[] = lvc1Raw.map((d, i) => ({
	date: new Date(monthDates[i]),
	stays: d.stays,
	value: d.stays,
	lvcCount: d.lvcCount,
	lvcProportion: parseFloat(((d.lvcCount / d.stays) * 100).toFixed(1)),
	breakdown: makeBreakdown(d.stays, i)
}));

export const kpis: KpiMetric[] = [
	{
		title: 'Total Patients',
		value: '1,247',
		unit: '',
		change: 4.2,
		subtitle: 'Currently on record'
	},
	{
		title: 'Hospital Stays',
		value: '3,899',
		unit: '',
		change: 2.8,
		subtitle: 'Last 12 months'
	},
	{
		title: 'LVC Proportion',
		value: '12.3',
		unit: '%',
		change: -1.4,
		subtitle: 'Of total procedures'
	}
];

// ── LVC 2 ── Unnecessary blood transfusions
// ~9% proportion, steady with a notable spike mid-year
const lvc2Raw = [
	{ stays: 312, lvcCount: 27 },
	{ stays: 298, lvcCount: 25 },
	{ stays: 334, lvcCount: 30 },
	{ stays: 321, lvcCount: 32 },
	{ stays: 308, lvcCount: 34 },
	{ stays: 345, lvcCount: 38 },
	{ stays: 367, lvcCount: 41 },
	{ stays: 389, lvcCount: 36 },
	{ stays: 301, lvcCount: 28 },
	{ stays: 278, lvcCount: 24 },
	{ stays: 312, lvcCount: 27 },
	{ stays: 334, lvcCount: 29 }
];

export const lvc2TimeSeries: MonthlyPatientData[] = lvc2Raw.map((d, i) => ({
	date: new Date(monthDates[i]),
	stays: d.stays,
	value: d.stays,
	lvcCount: d.lvcCount,
	lvcProportion: parseFloat(((d.lvcCount / d.stays) * 100).toFixed(1)),
	breakdown: makeBreakdown(d.stays, i + 7)
}));

export const kpis2: KpiMetric[] = [
	{
		title: 'Total Patients',
		value: '1,247',
		unit: '',
		change: 4.2,
		subtitle: 'Currently on record'
	},
	{
		title: 'Hospital Stays',
		value: '3,899',
		unit: '',
		change: 2.8,
		subtitle: 'Last 12 months'
	},
	{
		title: 'LVC Proportion',
		value: '9.1',
		unit: '%',
		change: 0.6,
		subtitle: 'Of total stays'
	}
];

// ── LVC 3 ── Routine blood tests / lab panels / X-rays without indication
// ~23% proportion, high but gradually declining (awareness campaign effect)
const lvc3Raw = [
	{ stays: 312, lvcCount: 78 },
	{ stays: 298, lvcCount: 74 },
	{ stays: 334, lvcCount: 82 },
	{ stays: 321, lvcCount: 79 },
	{ stays: 308, lvcCount: 74 },
	{ stays: 345, lvcCount: 83 },
	{ stays: 367, lvcCount: 86 },
	{ stays: 389, lvcCount: 88 },
	{ stays: 301, lvcCount: 68 },
	{ stays: 278, lvcCount: 61 },
	{ stays: 312, lvcCount: 67 },
	{ stays: 334, lvcCount: 71 }
];

export const lvc3TimeSeries: MonthlyPatientData[] = lvc3Raw.map((d, i) => ({
	date: new Date(monthDates[i]),
	stays: d.stays,
	value: d.stays,
	lvcCount: d.lvcCount,
	lvcProportion: parseFloat(((d.lvcCount / d.stays) * 100).toFixed(1)),
	breakdown: makeBreakdown(d.stays, i + 3)
}));

export const kpis3: KpiMetric[] = [
	{
		title: 'Total Patients',
		value: '1,247',
		unit: '',
		change: 4.2,
		subtitle: 'Currently on record'
	},
	{
		title: 'Hospital Stays',
		value: '3,899',
		unit: '',
		change: 2.8,
		subtitle: 'Last 12 months'
	},
	{
		title: 'LVC Proportion',
		value: '23.4',
		unit: '%',
		change: -2.9,
		subtitle: 'Of total stays'
	}
];
