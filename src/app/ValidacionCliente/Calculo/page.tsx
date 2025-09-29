'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ValidacionCalculoPage() {
    const Router = useRouter()

    useEffect(() => {
        Router.push("https://www.google.com/")
    }, []);
}