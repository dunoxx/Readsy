"use client";

import React, { useEffect, useState } from "react";
import { checkinApi } from "@/lib/checkinApi";
import { BookOpen, Mic, Clock } from "lucide-react";

interface Props {
  bookId: string;
}

export function CheckinTimeline({ bookId }: Props) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    checkinApi.history(bookId)
      .then((res) => setHistory(res.data))
      .finally(() => setLoading(false));
  }, [bookId]);

  if (!bookId) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-primary mb-2">Histórico de Check-ins</h3>
      {loading ? (
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      ) : history.length === 0 ? (
        <div className="text-gray-500 text-center">Nenhum check-in registrado para este livro.</div>
      ) : (
        <ul className="space-y-4">
          {history.map((item) => (
            <li key={item.id} className="card flex items-center space-x-4">
              <BookOpen className="h-6 w-6 text-blue" />
              <div className="flex-1">
                <div className="font-medium text-primary">Páginas lidas: {item.pagesRead} | Página atual: {item.currentPage}</div>
                <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
                {item.duration && (
                  <div className="text-xs text-gray-500 flex items-center"><Clock className="h-4 w-4 mr-1" /> Duração: {item.duration} min</div>
                )}
                {item.audioNoteUrl && (
                  <audio controls src={item.audioNoteUrl} className="mt-1">
                    Seu navegador não suporta áudio.
                  </audio>
                )}
              </div>
              {item.audioNoteUrl && <Mic className="h-5 w-5 text-green" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 