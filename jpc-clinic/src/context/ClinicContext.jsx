import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

const ClinicContext = createContext(null);

const seedStudents = [
    {
        id: '001',
        name: 'Juan Dela Cruz',
        type: 'Higher',
        course: 'BSIT',
        level: '3rd Year',
        contact: '09123456789',
    },
    {
        id: '002',
        name: 'Maria Santos',
        type: 'Higher',
        course: 'BSA',
        level: '2nd Year',
        contact: '09987654321',
    },
    {
        id: '003',
        name: 'Ana Reyes',
        type: 'Basic',
        course: 'Senior High',
        level: 'Grade 12',
        contact: '09112223344',
    },
    {
        id: '004',
        name: 'Carlos Gomez',
        type: 'Basic',
        course: 'Junior High',
        level: 'Grade 9',
        contact: '09223334455',
    },
];

function load(key, fallback) {
    try {
        const x = localStorage.getItem(key);
        return x ? JSON.parse(x) : fallback;
    } catch {
        return fallback;
    }
}

export function ClinicProvider({ children }) {
    const [students, setStudents] = useState(() =>
        load('jpc_students', seedStudents)
    );
    const [vitals, setVitals] = useState(() => load('jpc_vitals', []));
    const [medicines, setMedicines] = useState(() =>
        load('jpc_medicines', [])
    );
    const [visits, setVisits] = useState(() => load('jpc_visits', []));

    useEffect(() => {
        localStorage.setItem('jpc_students', JSON.stringify(students));
    }, [students]);

    useEffect(() => {
        localStorage.setItem('jpc_vitals', JSON.stringify(vitals));
    }, [vitals]);

    useEffect(() => {
        localStorage.setItem('jpc_medicines', JSON.stringify(medicines));
    }, [medicines]);

    useEffect(() => {
        localStorage.setItem('jpc_visits', JSON.stringify(visits));
    }, [visits]);

    const addStudent = (s) =>
        setStudents((x) => [
            ...x,
            { ...s, id: String(Date.now()).slice(-6) },
        ]);

    // addVitals now accepts an optional `advice` field for the student portal
    const addVitals = (v) => {
        setVitals((x) => [
            {
                ...v,
                id: crypto.randomUUID(),
                date: new Date().toLocaleString(),
            },
            ...x,
        ]);

        setVisits((x) => [
            {
                id: crypto.randomUUID(),
                student: v.patient,
                type: 'Vital Signs',
                date: new Date().toLocaleString(),
            },
            ...x,
        ]);
    };

    const addMedicine = (m) => {
        setMedicines((x) => [
            {
                ...m,
                id: crypto.randomUUID(),
                date: new Date().toLocaleString(),
            },
            ...x,
        ]);

        setVisits((x) => [
            {
                id: crypto.randomUUID(),
                student: m.patient,
                type: 'Medication',
                date: new Date().toLocaleString(),
            },
            ...x,
        ]);
    };

    const addVisit = (v) =>
        setVisits((x) => [
            {
                ...v,
                id: crypto.randomUUID(),
                date: new Date().toLocaleString(),
            },
            ...x,
        ]);

    const value = useMemo(
        () => ({
            students,
            vitals,
            medicines,
            visits,
            addStudent,
            addVitals,
            addMedicine,
            addVisit,
        }),
        [students, vitals, medicines, visits]
    );

    return (
        <ClinicContext.Provider value={value}>
            {children}
        </ClinicContext.Provider>
    );
}

export const useClinic = () => useContext(ClinicContext);
