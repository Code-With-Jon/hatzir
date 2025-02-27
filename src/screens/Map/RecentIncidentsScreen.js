import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const RecentIncidentsScreen = () => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const incidentsRef = collection(db, 'incidents');
    const q = query(
      incidentsRef,
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedIncidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        votes: doc.data().votes || 0,
        commentCount: doc.data().commentCount || 0,
        flagCount: doc.data().flagCount || 0,
      }));
      setIncidents(fetchedIncidents);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {/* Render your incidents here */}
    </div>
  );
};

export default RecentIncidentsScreen; 