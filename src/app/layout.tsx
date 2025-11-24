import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
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
						<SidebarProvider>{children}
							<Toaster
					position="top-right" 
					richColors 
					closeButton
					duration={4000} 
				/>
					</SidebarProvider>

				</ThemeProvider>
				</QueryProvider>

			</body>
		</html>
	);
}
