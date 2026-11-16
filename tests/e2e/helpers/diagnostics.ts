import { expect, type Page } from '@playwright/test'

export interface HttpFailure {
  url: string
  status: number
}

export interface RuntimeDiagnostics {
  pageErrors: string[]
  consoleErrors: string[]
  httpFailures: HttpFailure[]
  detach: () => void
}

export function attachRuntimeDiagnostics(page: Page): RuntimeDiagnostics {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  const httpFailures: HttpFailure[] = []

  const onPageError = (err: Error) => {
    pageErrors.push(err.message || String(err))
  }

  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  }

  const onResponse = (res: { url: () => string; status: () => number }) => {
    const status = res.status()
    if (status >= 400) {
      httpFailures.push({ url: res.url(), status })
    }
  }

  page.on('pageerror', onPageError)
  page.on('console', onConsole)
  page.on('response', onResponse)

  return {
    pageErrors,
    consoleErrors,
    httpFailures,
    detach: () => {
      page.off('pageerror', onPageError)
      page.off('console', onConsole)
      page.off('response', onResponse)
    }
  }
}

export function expectCleanRuntime(diag: RuntimeDiagnostics): void {
  expect(diag.pageErrors, `Unexpected uncaught page errors: ${diag.pageErrors.join(' | ')}`).toEqual([])
  expect(
    diag.consoleErrors,
    `Unexpected console.error messages: ${diag.consoleErrors.join(' | ')}`
  ).toEqual([])
  expect(
    diag.httpFailures,
    `Unexpected HTTP >= 400 responses: ${JSON.stringify(diag.httpFailures)}`
  ).toEqual([])
}
