/**
 * Utilitários para identificação e tratamento de dados mock
 */

/**
 * Verifica se um dado é mock baseado em diferentes critérios
 */
export const isMockData = (data: any): boolean => {
  if (!data) return false;

  // Verificar se é um objeto
  if (typeof data === 'object') {
    // Verificar ID que começa com "mock-"
    if (data.id && typeof data.id === 'string' && data.id.startsWith('mock-')) {
      return true;
    }

    // Verificar campos específicos que indicam mock
    if (data.missao_id && typeof data.missao_id === 'string' && data.missao_id.startsWith('mock-')) {
      return true;
    }

    // Verificar outros campos de ID que podem ser mock
    if (data.animal_id && typeof data.animal_id === 'string' && data.animal_id.startsWith('mock-')) {
      return true;
    }

    if (data.voluntario_id && typeof data.voluntario_id === 'string' && data.voluntario_id.startsWith('mock-')) {
      return true;
    }

    // REMOVIDO: Verificação por texto genérico que causava falsos positivos
    // Agora apenas IDs que começam com "mock-" são considerados mock
  }

  // Verificar se é string que começa com "mock-"
  if (typeof data === 'string' && data.startsWith('mock-')) {
    return true;
  }

  return false;
};

/**
 * Verifica se uma lista contém dados mock
 */
export const hasMockData = (dataList: any[]): boolean => {
  if (!Array.isArray(dataList)) return false;
  return dataList.some(item => isMockData(item));
};

/**
 * Verifica se dados são mock de forma mais restritiva
 * Apenas considera mock se IDs começam explicitamente com "mock-"
 */
export const isStrictMockData = (data: any): boolean => {
  if (!data) return false;

  // Verificar se é um objeto
  if (typeof data === 'object') {
    // Lista de campos de ID para verificar
    const idFields = ['id', 'missao_id', 'animal_id', 'voluntario_id', 'equipamento_id'];
    
    for (const field of idFields) {
      if (data[field] && typeof data[field] === 'string' && data[field].startsWith('mock-')) {
        return true;
      }
    }
  }

  // Verificar se é string que começa com "mock-"
  if (typeof data === 'string' && data.startsWith('mock-')) {
    return true;
  }

  return false;
};

/**
 * Verifica se uma lista contém dados mock usando verificação restritiva
 */
export const hasStrictMockData = (dataList: any[]): boolean => {
  if (!Array.isArray(dataList)) return false;
  return dataList.some(item => isStrictMockData(item));
};

/**
 * Filtra apenas dados mock de uma lista
 */
export const filterMockData = (dataList: any[]): any[] => {
  if (!Array.isArray(dataList)) return [];
  return dataList.filter(item => isMockData(item));
};

/**
 * Filtra apenas dados reais (não mock) de uma lista
 */
export const filterRealData = (dataList: any[]): any[] => {
  if (!Array.isArray(dataList)) return [];
  return dataList.filter(item => !isMockData(item));
};

/**
 * Conta quantos itens mock existem em uma lista
 */
export const countMockData = (dataList: any[]): number => {
  if (!Array.isArray(dataList)) return 0;
  return dataList.filter(item => isMockData(item)).length;
};

/**
 * Adiciona classe CSS para dados mock
 */
export const getMockDataClassName = (data: any, baseClassName: string = ''): string => {
  const mockClass = isMockData(data) ? 'mock-data' : '';
  return [baseClassName, mockClass].filter(Boolean).join(' ');
};