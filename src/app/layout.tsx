import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from 'sonner';

const outfit = Outfit({
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${outfit.className} dark:bg-gray-900`}>
				<QueryProvider>
					<ThemeProvider>
					<AuthProvider>
						<SidebarProvider>{children}
							<Toaster
					position="top-right" // Posición (top-right, bottom-right, etc.)
					richColors // Colores más vibrantes (opcional)
					closeButton // Botón de cerrar visible (opcional)
					duration={4000} // Duración en ms (opcional)
				/>
					</SidebarProvider>
					</AuthProvider>

				</ThemeProvider>
				</QueryProvider>

			</body>
		</html>
	);
}
