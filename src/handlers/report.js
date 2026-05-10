export function handleReportSubmission(event, request, operator, dialog, helpers) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const summary = helpers.safeTrim(data.get('summary'));
  const findings = helpers.safeTrim(data.get('findings'));
  const recommendations = helpers.safeTrim(data.get('recommendations'));

  if (!summary || !findings || !recommendations) {
    helpers.announce('Preencha todos os campos do relatório.');
    return;
  }

  request.report = {
    summary,
    findings,
    recommendations,
    generatedAt: new Date().toISOString(),
    operatorId: operator.id,
  };
  request.status = 'completed';
  request.updatedAt = new Date().toISOString();
  request.assignedOperatorId = operator.id;
  request.timeline.push(
    helpers.createTimelineEntry({
      actor: operator,
      title: 'Relatório final registrado',
      description: 'Missão concluída e relatório disponibilizado ao cliente.',
      category: 'report',
    })
  );

  helpers.saveState();
  dialog.close();
  helpers.announce('Relatório final salvo e missão concluída.');
  helpers.showSuccessNotification(
    'Missão concluída!',
    `Relatório final da solicitação ${request.id.toUpperCase()} foi enviado com sucesso`,
    6000
  );
}
