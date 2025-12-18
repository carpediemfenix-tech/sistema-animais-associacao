        {/* Custos das Intervenções */}
        {intervencoes.length > 0 && (
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Calculator className="h-6 w-6 mr-2" />
                Custos das Intervenções ({intervencoes.length})
              </CardTitle>
              <CardDescription className="text-blue-600">
                Custos automáticos das intervenções veterinárias com informações completas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {intervencoes.map((intervencao) => (
                  <div key={intervencao.id} className="bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
                    {/* Cabeçalho da Intervenção */}
                    <div className="flex items-center justify-between p-4 border-b border-blue-100">
                      <div className="flex items-center space-x-3">
                        {/* Ícone do Tipo */}
                        {intervencao.tipos_intervencoes?.icone && (
                          <span className="text-2xl">{intervencao.tipos_intervencoes.icone}</span>
                        )}
                        <div>
                          <h4 className="font-bold text-blue-900 text-lg">
                            {intervencao.tipos_intervencoes?.nome || 'Intervenção'}
                          </h4>
                          <p className="text-sm text-blue-600">
                            {new Date(intervencao.data_intervencao).toLocaleDateString('pt-PT', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status e Prioridade */}
                      <div className="flex items-center space-x-2">
                        {intervencao.urgente && (
                          <span className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
                            ⚠️ URGENTE
                          </span>
                        )}
                        {intervencao.estado && (
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                            intervencao.estado === 'concluida' ? 'bg-green-100 text-green-700 border-green-200' :
                            intervencao.estado === 'agendada' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            intervencao.estado === 'em_andamento' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            intervencao.estado === 'cancelada' ? 'bg-red-100 text-red-700 border-red-200' : 
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {intervencao.estado === 'concluida' ? '✓ Concluída' :
                             intervencao.estado === 'agendada' ? '📅 Agendada' :
                             intervencao.estado === 'em_andamento' ? '⏳ Em Andamento' :
                             intervencao.estado === 'cancelada' ? '❌ Cancelada' :
                             intervencao.estado.charAt(0).toUpperCase() + intervencao.estado.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Detalhes da Intervenção */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* Clínica */}
                        {intervencao.clinicas_veterinarias?.nome && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="flex items-center mb-1">
                              <span className="text-blue-600 mr-2">🏥</span>
                              <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Clínica</span>
                            </div>
                            <p className="font-semibold text-blue-900">{intervencao.clinicas_veterinarias.nome}</p>
                            {intervencao.clinicas_veterinarias.telefone && (
                              <p className="text-sm text-blue-600">📞 {intervencao.clinicas_veterinarias.telefone}</p>
                            )}
                            {intervencao.clinicas_veterinarias.endereco && (
                              <p className="text-sm text-blue-600">📍 {intervencao.clinicas_veterinarias.endereco}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Veterinário */}
                        {intervencao.veterinario && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <div className="flex items-center mb-1">
                              <span className="text-green-600 mr-2">👨‍⚕️</span>
                              <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Veterinário</span>
                            </div>
                            <p className="font-semibold text-green-900">Dr(a). {intervencao.veterinario}</p>
                          </div>
                        )}
                        
                        {/* Voluntário Responsável */}
                        {intervencao.voluntarios && (
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                            <div className="flex items-center mb-1">
                              <span className="text-purple-600 mr-2">👥</span>
                              <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">Voluntário</span>
                            </div>
                            <p className="font-semibold text-purple-900">
                              {intervencao.voluntarios.display_name || intervencao.voluntarios.full_name || intervencao.voluntarios.nome}
                            </p>
                          </div>
                        )}
                        
                        {/* Diagnóstico */}
                        {intervencao.diagnostico && (
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <div className="flex items-center mb-1">
                              <span className="text-orange-600 mr-2">🔍</span>
                              <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">Diagnóstico</span>
                            </div>
                            <p className="font-semibold text-orange-900">{intervencao.diagnostico}</p>
                          </div>
                        )}
                        
                        {/* Tratamento */}
                        {intervencao.tratamento && (
                          <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                            <div className="flex items-center mb-1">
                              <span className="text-teal-600 mr-2">💊</span>
                              <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">Tratamento</span>
                            </div>
                            <p className="font-semibold text-teal-900">{intervencao.tratamento}</p>
                          </div>
                        )}
                        
                        {/* Medicamentos */}
                        {intervencao.medicamentos && (
                          <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                            <div className="flex items-center mb-1">
                              <span className="text-pink-600 mr-2">💊</span>
                              <span className="text-xs font-medium text-pink-600 uppercase tracking-wide">Medicamentos</span>
                            </div>
                            <p className="font-semibold text-pink-900">{intervencao.medicamentos}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Próxima Consulta */}
                      {intervencao.proxima_consulta && (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
                          <div className="flex items-center">
                            <span className="text-yellow-600 mr-2">📅</span>
                            <span className="text-sm font-medium text-yellow-700">Próxima Consulta:</span>
                            <span className="ml-2 font-semibold text-yellow-900">
                              {new Date(intervencao.proxima_consulta).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Observações */}
                      {intervencao.observacoes && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center mb-2">
                            <span className="text-gray-600 mr-2">📝</span>
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Observações</span>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{intervencao.observacoes}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Custo */}
                    <div className="bg-blue-50 px-4 py-3 border-t border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-2">💰</span>
                          <span className="text-sm font-medium text-blue-700">Custo da Intervenção</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-blue-900">€{(intervencao.custo_final || 0).toFixed(2)}</p>
                          {intervencao.custo !== intervencao.custo_final && intervencao.custo > 0 && (
                            <p className="text-sm text-blue-600 line-through">€{(intervencao.custo || 0).toFixed(2)}</p>
                          )}
                          {intervencao.custo_final === 0 && (
                            <p className="text-sm text-green-600 font-medium">✓ Gratuito</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}