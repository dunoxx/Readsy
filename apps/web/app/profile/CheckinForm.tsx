"use client";

import React, { useState } from "react";
import { checkinApi } from "@/lib/checkinApi";
import toast from "react-hot-toast";

interface Props {
  onCheckinSuccess: () => void;
}

export function CheckinForm({ onCheckinSuccess }: Props) {
  const [form, setForm] = useState({
    bookId: "",
    pagesRead: 1,
    currentPage: 1,
    duration: 0,
    audioNoteUrl: "",
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleUploadAudio = async (): Promise<string> => {
    if (!audioFile) return "";
    // Mock: em produção, fazer upload real para storage e retornar URL
    if (!audioFile.name.endsWith(".mp3")) {
      toast.error("Apenas arquivos .mp3 são permitidos");
      throw new Error("Formato inválido");
    }
    // Simula upload e retorna URL fake
    return URL.createObjectURL(audioFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let audioUrl = "";
      if (audioFile) {
        audioUrl = await handleUploadAudio();
        await checkinApi.uploadAudio({ fileUrl: audioUrl });
      }
      await checkinApi.create({ ...form, audioNoteUrl: audioUrl });
      toast.success("Check-in registrado!");
      setForm({ ...form, pagesRead: 1, currentPage: 1, duration: 0, audioNoteUrl: "" });
      setAudioFile(null);
      onCheckinSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao registrar check-in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">ID do Livro</label>
        <input
          name="bookId"
          value={form.bookId}
          onChange={handleChange}
          className="input"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Páginas Lidas</label>
          <input
            name="pagesRead"
            type="number"
            min={1}
            value={form.pagesRead}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Página Atual</label>
          <input
            name="currentPage"
            type="number"
            min={1}
            value={form.currentPage}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tempo de Leitura (min)</label>
        <input
          name="duration"
          type="number"
          min={0}
          value={form.duration}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nota de Áudio (.mp3, até 60s)</label>
        <input
          type="file"
          accept="audio/mp3"
          onChange={handleAudioChange}
          className="input"
        />
        {audioFile && (
          <div className="mt-2 text-xs text-gray-500">Arquivo: {audioFile.name}</div>
        )}
      </div>
      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span>Registrar Check-in</span>
        )}
      </button>
    </form>
  );
} 