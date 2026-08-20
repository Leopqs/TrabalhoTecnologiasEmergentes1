import React, { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { ClassMaterial } from '../types';
import { generateMaterialWithGemini } from '../services/geminiService';
import {
  FolderOpen,
  Plus,
  Sparkles,
  FileText,
  Video,
  Link as LinkIcon,
  Code,
  FileCode,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Search,
  BookOpen,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';

export const MaterialsView: React.FC = () => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    activeClass,
    materials,
    addMaterial,
    deleteMaterial,
    toggleMaterialPublish,
    recordGeminiUsage,
  } = useAcademic();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Manual Add Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Unidade 1 - Fundamentos');
  const [fileType, setFileType] = useState<'pdf' | 'slide' | 'link' | 'video' | 'exercicio' | 'codigo'>('pdf');
  const [fileUrl, setFileUrl] = useState('');

  // AI Material Generator State
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'Graduação - Nível Médio' | 'Graduação - Avançado' | 'Introdução Prática'>('Graduação - Nível Médio');
  const [aiMaterialType, setAiMaterialType] = useState('Resumo Teórico e Lista de Exercícios');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const filteredMaterials = materials.filter((m) => {
    const matchClass = m.classId === activeClass.id;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
    return matchClass && matchSearch && matchCat;
  });

  const categories = Array.from(new Set(materials.filter((m) => m.classId === activeClass.id).map((m) => m.category)));

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMaterial({
      classId: activeClass.id,
      title,
      description,
      category,
      fileType,
      fileUrl: fileUrl || 'https://drive.google.com/exemplo-material',
      fileSize: '1.8 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      isPublished: true,
    });

    setTitle('');
    setDescription('');
    setFileUrl('');
    setIsAddModalOpen(false);
  };

  const handleGenerateWithAi = async () => {
    if (!aiTopic.trim()) {
      setAiError('Por favor informe o assunto ou tópico da aula.');
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const res = await generateMaterialWithGemini({
        subject: activeClass.name,
        topicName: aiTopic,
        materialType: aiMaterialType,
        difficulty: aiDifficulty,
        targetClass: `${activeClass.code} - ${activeClass.name}`,
      });

      if (res.success && res.data) {
        setAiResult(res.data);
        recordGeminiUsage(res.usage);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Falha ao gerar material com IA.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handlePublishAiMaterial = () => {
    if (!aiResult) return;

    addMaterial({
      classId: activeClass.id,
      title: aiResult.title || aiTopic,
      description: aiResult.summary || 'Material didático gerado via IA Gemini 3.7 Flash',
      category: 'Unidade 3 - Arquitetura de Software',
      fileType: 'exercicio',
      fileUrl: '#conteudo-gerado-ia',
      fileSize: '32 KB (Digital)',
      uploadDate: new Date().toISOString().split('T')[0],
      isPublished: true,
      aiGenerated: true,
      aiContent: aiResult,
    });

    setIsAiModalOpen(false);
    setAiResult(null);
    setAiTopic('');
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'slide':
        return <FileCode className="w-5 h-5 text-amber-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-rose-600" />;
      case 'link':
        return <LinkIcon className="w-5 h-5 text-blue-600" />;
      case 'codigo':
        return <Code className="w-5 h-5 text-purple-600" />;
      case 'exercicio':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <FolderOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Repositório de Materiais de Aula
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Envie slides, PDFs, listas de exercícios, códigos de exemplo e gere novos materiais com IA.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-open-ai-material-modal"
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Criar com IA (Gemini)
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Enviar Novo Material
          </button>
        </div>
      </div>

      {/* Class & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Turma:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.code} - {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Categoria / Unidade:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="all">Todas as Unidades ({materials.filter((m) => m.classId === activeClass.id).length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Buscar Material:</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou descrição..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Materials List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Nenhum material encontrado para esta turma.</p>
            <p className="text-xs text-slate-400">Clique em "Enviar Novo Material" ou "Criar com IA" para disponibilizar conteúdo aos alunos.</p>
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <div
              key={material.id}
              id={`material-card-${material.id}`}
              className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                material.isPublished ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getIconForType(material.fileType)}
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {material.category}
                      </span>
                      {material.aiGenerated && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          IA Gemini
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleMaterialPublish(material.id)}
                    className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    title={material.isPublished ? 'Material visível aos alunos' : 'Material oculto'}
                  >
                    {material.isPublished ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3 line-clamp-1">{material.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {material.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {material.uploadDate} • {material.fileSize}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => deleteMaterial(material.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Excluir material"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3" />
                    Baixar
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Manual Material Upload */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-600" />
                Cadastrar Material de Aula
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Documento / Aula:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Aula 08 - Microsserviços e Arquitetura Orientada a Eventos"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Arquivo:</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as any)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="pdf">Documento PDF</option>
                    <option value="slide">Apresentação de Slides</option>
                    <option value="exercicio">Lista de Exercícios</option>
                    <option value="codigo">Código Fonte / Repositório</option>
                    <option value="video">Vídeo Gravado</option>
                    <option value="link">Link Externo / Artigo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unidade Curricular:</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição do Conteúdo:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instruções para os estudantes, capítulos do livro ou exercícios a resolver..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL de Acesso ou Arquivo:</label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  Publicar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Material Generator (Gemini) */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Gerador de Material Didático e Exercícios com IA
                  </h3>
                  <p className="text-xs text-slate-500">
                    Utiliza o modelo Gemini 3.7 Flash para criar resumos, questões práticas e gabaritos.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {!aiResult ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Qual tópico ou conceito da disciplina você deseja gerar?
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Ex: Padrão Observer e Event-Driven Architecture em Node.js"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Formato do Material:</label>
                      <select
                        value={aiMaterialType}
                        onChange={(e) => setAiMaterialType(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Resumo Teórico e Lista de Exercícios">Resumo + 5 Questões Práticas</option>
                        <option value="Estudo de Caso Prático">Estudo de Caso com Solução Passo a Passo</option>
                        <option value="Roteiro de Laboratório e Código">Roteiro de Prática em Laboratório</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nível de Rigor / Dificuldade:</label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value as any)}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Introdução Prática">Introdução e Fixação Básica</option>
                        <option value="Graduação - Nível Médio">Graduação - Nível Médio / Padrão</option>
                        <option value="Graduação - Avançado">Graduação Avançada / Complexo</option>
                      </select>
                    </div>
                  </div>

                  {aiError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                      {aiError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGenerateWithAi}
                    disabled={isGeneratingAi}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isGeneratingAi ? 'Gerando Material com IA...' : 'Gerar Material Didático'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900">{aiResult.title}</h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">{aiResult.summary}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded text-[10px] font-bold">
                      Pronto para Publicar
                    </span>
                  </div>

                  {aiResult.suggestedTags && aiResult.suggestedTags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {aiResult.suggestedTags.map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Markdown Content Box */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Conteúdo e Estrutura Pedagógica:
                    </h5>
                    <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
                      {aiResult.contentMarkdown}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setAiResult(null);
                  setIsAiModalOpen(false);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>

              {aiResult && (
                <button
                  type="button"
                  onClick={handlePublishAiMaterial}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Adicionar aos Materiais da Turma
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
