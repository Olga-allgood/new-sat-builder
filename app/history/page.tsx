'use client'
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';

export default function HistoryPage(){
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState('');
}