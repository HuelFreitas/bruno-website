import { jsPDF } from 'jspdf';
import { formatDate, formatFileSize } from '../utils/misc.js';

export function exportReport(request, { resolveUser, showSuccessNotification, showErrorNotification }) {
  if (!request.report) return;

  const client = resolveUser(request.clientId);
  const operator = resolveUser(request.report.operatorId || request.assignedOperatorId);

  if (typeof jsPDF === 'undefined') {
    showErrorNotification(
      'Biblioteca não carregada',
      'A biblioteca PDF não está disponível. Execute `npm install` para instalar dependências.',
      5000
    );
    return;
  }

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    const addText = (text, x = margin, y = yPosition, options = {}) => {
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(lines, x, y, options);
      return y + (lines.length * 6) + 5;
    };

    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    yPosition = addText(`Relatório B&B Educacão - ${request.title}`, margin, yPosition);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(`Código: ${request.id.toUpperCase()} • ${formatDate(request.report.generatedAt)}`, margin, yPosition);

    yPosition += 10;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    yPosition = addText('Resumo Executivo', margin, yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(request.report.summary, margin, yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    yPosition = addText('Achados / Ocorrências', margin, yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(request.report.findings, margin, yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    yPosition = addText('Recomendações', margin, yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(request.report.recommendations, margin, yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    yPosition = addText('Dados da Operação', margin, yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(`Cliente: ${client.name}`, margin, yPosition);
    yPosition = addText(`Operador: ${operator.name}`, margin, yPosition);
    yPosition = addText(`Porto: ${request.port}`, margin, yPosition);
    yPosition = addText(`Embarcação: ${request.vessel}`, margin, yPosition);
    yPosition = addText(`Data: ${formatDate(request.scheduledFor)}`, margin, yPosition);
    yPosition += 10;

    if (request.evidence && request.evidence.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      yPosition = addText('Evidências Anexadas', margin, yPosition);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      request.evidence.forEach(evidence => {
        yPosition = addText(`• ${evidence.name} (${formatFileSize(evidence.size)})`, margin, yPosition);
      });
      yPosition += 10;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    yPosition = addText('Linha do Tempo', margin, yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    [...request.timeline]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .forEach(event => {
        yPosition = addText(`${formatDate(event.timestamp)} - ${event.title}`, margin, yPosition);
        yPosition = addText(`Por: ${event.actor?.name || 'Usuário'}`, margin + 10, yPosition);
        yPosition = addText(event.description, margin + 10, yPosition);
        yPosition += 5;
      });

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('B&B Educacão • Fiscalização marítima com cães farejadores', pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`relatorio_${request.id}_${new Date().toISOString().split('T')[0]}.pdf`);

    showSuccessNotification(
      "PDF gerado!",
      `Relatório ${request.id.toUpperCase()} foi exportado como PDF`,
      4000
    );
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    showErrorNotification(
      "Erro ao gerar PDF",
      "Ocorreu um erro ao gerar o arquivo PDF. Tente novamente.",
      5000
    );
  }
}
