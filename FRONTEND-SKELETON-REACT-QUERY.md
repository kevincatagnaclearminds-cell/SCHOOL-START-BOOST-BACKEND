# Frontend: Skeleton Loaders + React Query

## 📦 INSTALACIÓN

```bash
npm install @tanstack/react-query
# o
yarn add @tanstack/react-query
```

---

## 🎨 1. COMPONENTES SKELETON

### `src/components/skeletons/FormSkeleton.tsx`

```tsx
export const FormSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Título */}
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      
      {/* Campos del formulario */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
      
      {/* Botón */}
      <div className="h-12 bg-gray-200 rounded w-full"></div>
    </div>
  );
};
```

### `src/components/skeletons/SchoolListSkeleton.tsx`

```tsx
export const SchoolListSkeleton = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg animate-pulse">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### `src/components/skeletons/RankingSkeleton.tsx`

```tsx
export const RankingSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="h-10 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      
      {/* Ranking items */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-48"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
};
```

### `src/components/skeletons/StudentCardSkeleton.tsx`

```tsx
export const StudentCardSkeleton = () => {
  return (
    <div className="border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      
      <div className="flex justify-between pt-4 border-t">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};
```

---

## ⚙️ 2. CONFIGURACIÓN REACT QUERY

### `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### `src/App.tsx` (o `src/main.tsx`)

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Tu app aquí */}
    </QueryClientProvider>
  );
}

export default App;
```

---

## 🔌 3. HOOKS DE API

### `src/hooks/api/useStudents.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Tipos
interface Student {
  cedula: string;
  nombre: string;
  apellido: string;
  edad: number;
  genero: string;
  provincia: string;
  canton: string;
  nivelEducativo: string;
  schoolId: string | null;
  puntaje: number;
  completado: boolean;
}

interface CreateStudentData {
  cedula: string;
  nombre: string;
  apellido: string;
  edad: number;
  genero: string;
  provincia: string;
  canton: string;
  nivelEducativo: string;
  schoolId: string | null;
}

// GET /api/students/:cedula
export const useStudent = (cedula: string) => {
  return useQuery({
    queryKey: ['student', cedula],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/students/${cedula}`);
      if (!res.ok) throw new Error('Error al obtener estudiante');
      return res.json() as Promise<Student>;
    },
    enabled: !!cedula, // Solo ejecutar si hay cédula
  });
};

// POST /api/students
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateStudentData) => {
      const res = await fetch(`${API_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear estudiante');
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidar cache para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

// PUT /api/students/:cedula
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cedula, data }: { cedula: string; data: Partial<Student> }) => {
      const res = await fetch(`${API_URL}/api/students/${cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al actualizar estudiante');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar cache del estudiante específico
      queryClient.invalidateQueries({ queryKey: ['student', variables.cedula] });
    },
  });
};
```

### `src/hooks/api/useSchools.ts`

```typescript
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface School {
  _id: string;
  nombre: string;
  provincia: string;
  canton: string;
  nivelEducativo: string;
  totalEstudiantes: number;
  estudiantesCompletados: number;
  puntajeTotal: number;
}

// GET /api/schools
export const useSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/schools`);
      if (!res.ok) throw new Error('Error al obtener escuelas');
      return res.json() as Promise<School[]>;
    },
  });
};

// GET /api/schools (filtrado para selector)
export const useSchoolsForSelect = () => {
  return useQuery({
    queryKey: ['schools', 'select'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/schools`);
      if (!res.ok) throw new Error('Error al obtener escuelas');
      const schools = await res.json() as School[];
      // Retornar solo lo necesario para el selector
      return schools.map(s => ({
        id: s._id,
        nombre: s.nombre,
        provincia: s.provincia,
        canton: s.canton,
      }));
    },
  });
};
```

### `src/hooks/api/useRanking.ts`

```typescript
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RankingSchool {
  _id: string;
  nombre: string;
  provincia: string;
  canton: string;
  totalEstudiantes: number;
  estudiantesCompletados: number;
  puntajeTotal: number;
  puntajePromedio: number;
  posicion: number;
}

// GET /api/ranking
export const useRanking = () => {
  return useQuery({
    queryKey: ['ranking'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/ranking`);
      if (!res.ok) throw new Error('Error al obtener ranking');
      return res.json() as Promise<RankingSchool[]>;
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
};
```

---

## 🎯 4. EJEMPLO DE USO

### Formulario de Registro con Skeleton

```tsx
import { useCreateStudent } from '@/hooks/api/useStudents';
import { useSchoolsForSelect } from '@/hooks/api/useSchools';
import { FormSkeleton } from '@/components/skeletons/FormSkeleton';
import { SchoolListSkeleton } from '@/components/skeletons/SchoolListSkeleton';

export const StudentRegistrationForm = () => {
  const [isIndependent, setIsIndependent] = useState(false);
  
  // React Query hooks
  const { data: schools, isLoading: loadingSchools } = useSchoolsForSelect();
  const createStudent = useCreateStudent();

  const handleSubmit = async (formData: CreateStudentData) => {
    try {
      await createStudent.mutateAsync({
        ...formData,
        schoolId: isIndependent ? null : formData.schoolId,
      });
      alert('¡Estudiante registrado exitosamente!');
    } catch (error) {
      alert(error.message);
    }
  };

  // Mostrar skeleton mientras carga
  if (loadingSchools) {
    return (
      <div>
        <FormSkeleton />
        <SchoolListSkeleton />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      
      <label>
        <input
          type="checkbox"
          checked={isIndependent}
          onChange={(e) => setIsIndependent(e.target.checked)}
        />
        No estoy estudiando actualmente en ninguna unidad educativa
      </label>

      {!isIndependent && (
        <select name="schoolId" required>
          <option value="">Selecciona tu escuela</option>
          {schools?.map(school => (
            <option key={school.id} value={school.id}>
              {school.nombre} - {school.provincia}
            </option>
          ))}
        </select>
      )}

      <button 
        type="submit" 
        disabled={createStudent.isPending}
      >
        {createStudent.isPending ? 'Registrando...' : 'Registrar'}
      </button>

      {createStudent.isError && (
        <p className="text-red-500">{createStudent.error.message}</p>
      )}
    </form>
  );
};
```

### Ranking con Skeleton

```tsx
import { useRanking } from '@/hooks/api/useRanking';
import { RankingSkeleton } from '@/components/skeletons/RankingSkeleton';

export const RankingDashboard = () => {
  const { data: ranking, isLoading, error } = useRanking();

  if (isLoading) return <RankingSkeleton />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Ranking de Escuelas</h2>
      {ranking?.map((school, index) => (
        <div key={school._id}>
          <span>#{index + 1}</span>
          <span>{school.nombre}</span>
          <span>{school.puntajeTotal} puntos</span>
          <span>{school.totalEstudiantes} estudiantes</span>
        </div>
      ))}
    </div>
  );
};
```

### Buscar Estudiante con Skeleton

```tsx
import { useState } from 'react';
import { useStudent } from '@/hooks/api/useStudents';
import { StudentCardSkeleton } from '@/components/skeletons/StudentCardSkeleton';

export const StudentSearch = () => {
  const [cedula, setCedula] = useState('');
  const [searchCedula, setSearchCedula] = useState('');
  
  const { data: student, isLoading, error } = useStudent(searchCedula);

  const handleSearch = () => {
    setSearchCedula(cedula);
  };

  return (
    <div>
      <input
        type="text"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
        placeholder="Ingresa tu cédula"
      />
      <button onClick={handleSearch}>Buscar</button>

      {isLoading && <StudentCardSkeleton />}
      
      {error && <p>Estudiante no encontrado</p>}
      
      {student && (
        <div>
          <h3>{student.nombre} {student.apellido}</h3>
          <p>Cédula: {student.cedula}</p>
          <p>Edad: {student.edad}</p>
          <p>Puntaje: {student.puntaje}</p>
          <p>Completado: {student.completado ? 'Sí' : 'No'}</p>
        </div>
      )}
    </div>
  );
};
```

---

## 🎨 5. ESTILOS TAILWIND (opcional)

Si usas Tailwind CSS, los skeletons ya están listos. Si no, agrega estos estilos CSS:

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## ✅ BENEFICIOS

1. **Skeleton Loaders**: Mejor UX mientras cargan los datos
2. **React Query**: 
   - Cache automático
   - Refetch inteligente
   - Estados de loading/error manejados
   - Invalidación de cache automática
3. **Código limpio**: Hooks reutilizables
4. **Performance**: Menos llamadas innecesarias a la API

---

## 📝 CHECKLIST

- [ ] Instalar @tanstack/react-query
- [ ] Crear componentes skeleton
- [ ] Configurar QueryClient
- [ ] Crear hooks de API
- [ ] Integrar en componentes existentes
- [ ] Probar estados de loading
- [ ] Probar manejo de errores

