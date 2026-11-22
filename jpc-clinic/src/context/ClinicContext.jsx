import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { API_URL } from '../config.js';

const ClinicContext = createContext(null);

const RECORDS_URL = `${API_URL}/api/records`;

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

// Demo students: hindi ito ina-upload sa TiDB
const SEED_IDS = new Set(seedStudents.map((s) => s.id));

function load(key, fallback) {
    try {
        const x = localStorage.getItem(key);
        return x ? JSON.parse(x) : fallback;
    } catch {
        return fallback;
    }
}

// students: pinakaluma muna (gaya ng dati). Vitals/medicines/visits: pinakabago muna.
function sortRecords(kind, list) {
    const dir = kind === 'students' ? 1 : -1;
    return [...list].sort((a, b) => dir * ((a.createdAt || 0) - (b.createdAt || 0)));
}

// Lagyan ng createdAt ang mga lumang local record na wala pa nito
function stampLegacy(kind, list) {
    const base = Date.now();
    const n = list.length;
    return list.map((item, i) => {
        if (item.createdAt) return item;
        const age = kind === 'students' ? n - 1 - i : i;
        return { ...item, createdAt: base - (age + 1) * 1000 };
    });
}

// I-save sa TiDB (sa pamamagitan ng Render backend)
async function saveOnline(kind, items) {
    const res = await fetch(`${RECORDS_URL}/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
    });
    if (!res.ok) throw new Error('Save failed');
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
    const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | online | offline

    const latest = useRef({ students, vitals, medicines, visits });
    latest.current = { students, vitals, medicines, visits };
    const syncing = useRef(false);

    // ====== Local copy (browser) ======
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

    // ====== Online copy (TiDB) ======
    const syncNow = useCallback(async () => {
        if (syncing.current) return;
        syncing.current = true;
        setSyncStatus('syncing');

        try {
            const res = await fetch(RECORDS_URL);
            if (!res.ok) throw new Error('Fetch failed');
            const server = await res.json();

            const setters = {
                students: setStudents,
                vitals: setVitals,
                medicines: setMedicines,
                visits: setVisits,
            };

            for (const kind of Object.keys(setters)) {
                const serverList = server[kind] || [];
                const serverIds = new Set(serverList.map((i) => String(i.id)));

                // Mga local na wala pa sa TiDB -> i-upload
                const missing = latest.current[kind].filter(
                    (i) =>
                        !serverIds.has(String(i.id)) &&
                        !(kind === 'students' && SEED_IDS.has(i.id))
                );
                const toUpload = stampLegacy(kind, missing);
                if (toUpload.length > 0) {
                    await saveOnline(kind, toUpload);
                }

                // Pagsamahin ang local at online
                const stamped = new Map(toUpload.map((i) => [String(i.id), i]));
                setters[kind]((current) => {
                    const merged = new Map();
                    current.forEach((i) =>
                        merged.set(String(i.id), stamped.get(String(i.id)) || i)
                    );
                    serverList.forEach((i) => merged.set(String(i.id), i));
                    return sortRecords(kind, [...merged.values()]);
                });
            }

            setSyncStatus('online');
        } catch (err) {
            console.warn('Sync failed, local data muna ang gagamitin:', err.message);
            setSyncStatus('offline');
        } finally {
            syncing.current = false;
        }
    }, []);

    // Mag-sync pag nag-open ang app, pag bumalik ang internet, at pag binalikan ang tab
    useEffect(() => {
        syncNow();

        const onOnline = () => syncNow();
        const onVisible = () => {
            if (document.visibilityState === 'visible') syncNow();
        };

        window.addEventListener('online', onOnline);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.removeEventListener('online', onOnline);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [syncNow]);

    const persist = (kind, item) => {
        saveOnline(kind, [item]).catch(() => setSyncStatus('offline'));
    };

    // ====== Mga function na ginagamit ng mga page ======
    const addStudent = (s) => {
        const item = {
            ...s,
            id: String(Date.now()).slice(-6),
            createdAt: Date.now(),
        };
        setStudents((x) => [...x, item]);
        persist('students', item);
    };

    // addVitals now accepts an optional `advice` field for the student portal
    const addVitals = (v) => {
        const now = Date.now();
        const date = new Date().toLocaleString();

        const vital = { ...v, id: crypto.randomUUID(), date, createdAt: now };
        const visit = {
            id: crypto.randomUUID(),
            student: v.patient,
            type: 'Vital Signs',
            date,
            createdAt: now,
        };

        setVitals((x) => [vital, ...x]);
        setVisits((x) => [visit, ...x]);
        persist('vitals', vital);
        persist('visits', visit);
    };

    const addMedicine = (m) => {
        const now = Date.now();
        const date = new Date().toLocaleString();

        const medicine = { ...m, id: crypto.randomUUID(), date, createdAt: now };
        const visit = {
            id: crypto.randomUUID(),
            student: m.patient,
            type: 'Medication',
            date,
            createdAt: now,
        };

        setMedicines((x) => [medicine, ...x]);
        setVisits((x) => [visit, ...x]);
        persist('medicines', medicine);
        persist('visits', visit);
    };

    const addVisit = (v) => {
        const item = {
            ...v,
            id: crypto.randomUUID(),
            date: new Date().toLocaleString(),
            createdAt: Date.now(),
        };
        setVisits((x) => [item, ...x]);
        persist('visits', item);
    };

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
            syncStatus,
            syncNow,
        }),
        [students, vitals, medicines, visits, syncStatus, syncNow]
    );

    return (
        <ClinicContext.Provider value={value}>
            {children}
        </ClinicContext.Provider>
    );
}

export const useClinic = () => useContext(ClinicContext);