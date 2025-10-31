import * as express from 'express'
import * as path from 'path'
import * as fs from 'fs'
import { RouteLoadResult } from '../types/serverTypes'

export async function loadRoutes(app: express.Application): Promise<void> {
  console.log('🚀 Loading routes...')

  const routesPath = path.join(__dirname, '..', 'routes')

  if (!fs.existsSync(routesPath)) {
    throw new Error('Routes directory not found')
  }

  try {
    const files = await fs.promises.readdir(routesPath)
    const routeFiles = files.filter((file) => file.endsWith('.ts') || file.endsWith('.js'))

    if (routeFiles.length === 0) {
      return
    }

    const routePromises: Promise<RouteLoadResult>[] = routeFiles.map(async (file): Promise<RouteLoadResult> => {
      try {
        const routePath = path.join(routesPath, file)
        const routeModule = await import(routePath)
        const router = routeModule.default || routeModule
        const routeName = file.replace('.ts', '').replace('.js', '')

        app.use(`/api/${routeName}`, router)

        return {
          success: true,
          route: `/api/${routeName}`,
        }
      } catch (routeError: any) {
        console.error(`❌ Failed to load route ${file}:`, routeError.message || routeError)
        return {
          success: false,
          route: file,
          error: routeError.message || routeError.toString(),
        }
      }
    })

    const results = await Promise.all(routePromises)
    const successfulRoutes = results.filter((result) => result.success)
    const failedRoutes = results.filter((result) => !result.success)

    console.log(`✅ Routes loaded: ${successfulRoutes.length}/${results.length}`)

    if (failedRoutes.length > 0) {
      console.error(`❌ ${failedRoutes.length} route(s) failed to load`)
      throw new Error(`${failedRoutes.length} route(s) failed to load`)
    }
  } catch (error) {
    console.error('❌ Route loading failed:', error)
    throw error
  }
}

export class RouteLoader {
  static async loadAll(app: express.Application): Promise<void> {
    await loadRoutes(app)
  }

  static async loadSingle(app: express.Application, routeName: string): Promise<boolean> {
    try {
      const routePath = path.join(__dirname, '..', 'routes', `${routeName}.ts`)
      const routeModule = await import(routePath)
      const router = routeModule.default || routeModule

      app.use(`/api/${routeName}`, router)
      console.log(`✅ Loaded single route: /api/${routeName}`)
      return true
    } catch (error: any) {
      console.error(`❌ Failed to load route ${routeName}:`, error.message)
      return false
    }
  }
}
