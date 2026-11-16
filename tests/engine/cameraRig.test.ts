import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { CameraRig, computeDrawerCompensatedGoal } from '../../src/engine/CameraRig'
import { projectWorldToScreen } from '../../src/engine/telemetry'

describe('CameraRig (F8)', () => {
  it('configures OrbitControls damping, touch gestures, and clamped distances', () => {
    const cam = new THREE.PerspectiveCamera(50, 1280 / 800, 0.5, 6000)
    const rig = new CameraRig(cam, null)

    expect(rig.controls.enableDamping).toBe(true)
    expect(rig.controls.touches.ONE).toBe(THREE.TOUCH.ROTATE)
    expect(rig.controls.touches.TWO).toBe(THREE.TOUCH.DOLLY_PAN)
    expect(rig.controls.minDistance).toBe(6)
    expect(rig.controls.maxDistance).toBe(600)

    rig.setBoundsRadius(300)
    expect(rig.controls.maxDistance).toBe(1050)

    rig.dispose()
  })

  it('flyTo with offsetRightPx=400 on 1280x800 centers target in left pane (x ≈ 440)', () => {
    const cam = new THREE.PerspectiveCamera(50, 1280 / 800, 0.5, 6000)
    const rig = new CameraRig(cam, null)
    rig.setViewportSize(1280, 800)

    const target = new THREE.Vector3(25, -10, 15)
    const desiredPos = new THREE.Vector3(25, 10, 65)

    const compensated = computeDrawerCompensatedGoal(
      desiredPos,
      target,
      cam.fov,
      1280,
      800,
      400
    )
    expect(compensated.target.x).toBeGreaterThan(target.x)

    rig.flyTo(desiredPos, target, { durationMs: 0, offsetRightPx: 400 })
    expect(rig.isFlying).toBe(false)

    const projected = projectWorldToScreen(
      [target.x, target.y, target.z],
      cam,
      { width: 1280, height: 800 }
    )
    expect(projected).not.toBeNull()
    expect(projected!.inView).toBe(true)
    expect(Math.abs(projected!.x - 440)).toBeLessThan(1.0)

    rig.dispose()
  })

  it('smoothly animates flyTo and cancels immediately on cancelFlyTo / OrbitControls start', () => {
    const cam = new THREE.PerspectiveCamera(50, 1.6, 0.5, 6000)
    cam.position.set(0, 0, 200)
    const rig = new CameraRig(cam, null)

    rig.flyTo(new THREE.Vector3(50, 20, 40), new THREE.Vector3(50, 0, 0), { durationMs: 500 })
    expect(rig.isFlying).toBe(true)

    // CameraRig clamps dtSec to 0.1s per step for tab-switch safety
    for (let i = 0; i < 3; i++) rig.update(0.08)
    expect(rig.isFlying).toBe(true)
    expect(cam.position.x).toBeGreaterThan(15)
    expect(cam.position.x).toBeLessThan(45)

    // Simulated user OrbitControls 'start' event cancels flight immediately
    rig.controls.dispatchEvent({ type: 'start' } as never)
    expect(rig.isFlying).toBe(false)
    expect(rig.controls.enableDamping).toBe(true)

    // Second flight completes naturally
    rig.flyTo(new THREE.Vector3(0, 10, 60), new THREE.Vector3(0, 0, 0), { durationMs: 400 })
    expect(rig.isFlying).toBe(true)
    for (let i = 0; i < 6; i++) rig.update(0.1)
    expect(rig.isFlying).toBe(false)
    expect(cam.position.z).toBeCloseTo(60, 2)

    rig.dispose()
  })

  it('manages focus-orbit and pause states and disposes cleanly with null domElement', () => {
    const cam = new THREE.PerspectiveCamera(50, 1.6, 0.5, 6000)
    const rig = new CameraRig(cam, null)

    rig.setFocusOrbit(true, 0.8)
    expect(rig.controls.autoRotate).toBe(true)
    expect(rig.controls.autoRotateSpeed).toBe(0.8)

    rig.setOrbitPaused(true)
    expect(rig.controls.autoRotate).toBe(false)

    rig.setOrbitPaused(false)
    expect(rig.controls.autoRotate).toBe(true)

    expect(() => rig.dispose()).not.toThrow()
  })

  it('cancels flyTo on domElement pointerdown/wheel and detaches listeners on dispose', () => {
    const rigListeners = new Map<string, Set<EventListener>>()
    const noopTarget = {
      addEventListener: () => {},
      removeEventListener: () => {}
    }
    const mockDom = {
      style: {},
      ownerDocument: noopTarget,
      setPointerCapture: () => {},
      releasePointerCapture: () => {},
      getRootNode: () => noopTarget,
      addEventListener: (type: string, fn: EventListener, opts?: AddEventListenerOptions | boolean) => {
        // CameraRig registers pointerdown & wheel with { passive: true }
        if (typeof opts === 'object' && opts?.passive === true) {
          let set = rigListeners.get(type)
          if (!set) {
            set = new Set()
            rigListeners.set(type, set)
          }
          set.add(fn)
        }
      },
      removeEventListener: (type: string, fn: EventListener) => {
        rigListeners.get(type)?.delete(fn)
      }
    } as unknown as HTMLElement

    const cam = new THREE.PerspectiveCamera(50, 1.6, 0.5, 6000)
    const rig = new CameraRig(cam, mockDom)

    rig.flyTo(new THREE.Vector3(40, 20, 40), new THREE.Vector3(0, 0, 0), { durationMs: 600 })
    expect(rig.isFlying).toBe(true)
    expect(rigListeners.get('pointerdown')?.size).toBe(1)
    for (const fn of rigListeners.get('pointerdown') ?? []) {
      fn({} as Event)
    }
    expect(rig.isFlying).toBe(false)

    rig.flyTo(new THREE.Vector3(-40, 20, 40), new THREE.Vector3(0, 0, 0), { durationMs: 600 })
    expect(rig.isFlying).toBe(true)
    expect(rigListeners.get('wheel')?.size).toBe(1)
    for (const fn of rigListeners.get('wheel') ?? []) {
      fn({} as Event)
    }
    expect(rig.isFlying).toBe(false)

    rig.dispose()
    expect(rigListeners.get('pointerdown')?.size ?? 0).toBe(0)
    expect(rigListeners.get('wheel')?.size ?? 0).toBe(0)
  })

  it('flushes residual OrbitControls damping inertia before instant/reduced-motion flyTo', () => {
    const domListeners = new Map<string, Set<EventListener>>()
    const docListeners = new Map<string, Set<EventListener>>()
    const emit = (map: Map<string, Set<EventListener>>, type: string, evt: unknown) => {
      for (const fn of map.get(type) ?? []) {
        fn(evt as Event)
      }
    }
    const mockDoc = {
      addEventListener: (type: string, fn: EventListener) => {
        let set = docListeners.get(type)
        if (!set) {
          set = new Set()
          docListeners.set(type, set)
        }
        set.add(fn)
      },
      removeEventListener: (type: string, fn: EventListener) => {
        docListeners.get(type)?.delete(fn)
      }
    }
    const mockDom = {
      style: {},
      clientWidth: 1280,
      clientHeight: 800,
      ownerDocument: mockDoc,
      setPointerCapture: () => {},
      releasePointerCapture: () => {},
      getRootNode: () => mockDoc,
      addEventListener: (type: string, fn: EventListener) => {
        let set = domListeners.get(type)
        if (!set) {
          set = new Set()
          domListeners.set(type, set)
        }
        set.add(fn)
      },
      removeEventListener: (type: string, fn: EventListener) => {
        domListeners.get(type)?.delete(fn)
      }
    } as unknown as HTMLElement

    const cam = new THREE.PerspectiveCamera(50, 1280 / 800, 0.5, 6000)
    cam.position.set(0, 40, 120)
    const rig = new CameraRig(cam, mockDom)

    // Inject real OrbitControls rotation + pan inertia via pointer drags while damping is active
    emit(domListeners, 'pointerdown', {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 400,
      clientY: 300
    })
    emit(docListeners, 'pointermove', {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 680,
      clientY: 420
    })
    rig.update(0.016)
    emit(docListeners, 'pointerup', { pointerId: 1, pointerType: 'mouse', button: 0 })

    // Also inject pan offset via right-mouse drag
    emit(domListeners, 'pointerdown', {
      pointerId: 2,
      pointerType: 'mouse',
      button: 2,
      clientX: 500,
      clientY: 300
    })
    emit(docListeners, 'pointermove', {
      pointerId: 2,
      pointerType: 'mouse',
      clientX: 700,
      clientY: 450
    })
    rig.update(0.016)
    emit(docListeners, 'pointerup', { pointerId: 2, pointerType: 'mouse', button: 2 })

    // Snap via reducedMotion: true — residual damping must NOT nudge camera off goalPos/goalTarget
    const goalPos = new THREE.Vector3(10, 25, 90)
    const goalTarget = new THREE.Vector3(10, 5, 10)
    rig.flyTo(goalPos, goalTarget, { reducedMotion: true })

    expect(cam.position.x).toBeCloseTo(goalPos.x, 5)
    expect(cam.position.y).toBeCloseTo(goalPos.y, 5)
    expect(cam.position.z).toBeCloseTo(goalPos.z, 5)
    expect(rig.controls.target.x).toBeCloseTo(goalTarget.x, 5)
    expect(rig.controls.target.y).toBeCloseTo(goalTarget.y, 5)
    expect(rig.controls.target.z).toBeCloseTo(goalTarget.z, 5)

    // Subsequent damped update frames must also remain on goalPos/goalTarget
    rig.update(0.016)
    expect(cam.position.x).toBeCloseTo(goalPos.x, 5)
    expect(cam.position.y).toBeCloseTo(goalPos.y, 5)
    expect(cam.position.z).toBeCloseTo(goalPos.z, 5)
    expect(rig.controls.enableDamping).toBe(true)

    rig.dispose()
  })

  it('flushes residual OrbitControls damping inertia before animated flyTo (short & standard durations)', () => {
    const createRigWithInertia = () => {
      const domListeners = new Map<string, Set<EventListener>>()
      const docListeners = new Map<string, Set<EventListener>>()
      const emit = (map: Map<string, Set<EventListener>>, type: string, evt: unknown) => {
        for (const fn of map.get(type) ?? []) {
          fn(evt as Event)
        }
      }
      const mockDoc = {
        addEventListener: (type: string, fn: EventListener) => {
          let set = docListeners.get(type)
          if (!set) {
            set = new Set()
            docListeners.set(type, set)
          }
          set.add(fn)
        },
        removeEventListener: (type: string, fn: EventListener) => {
          docListeners.get(type)?.delete(fn)
        }
      }
      const mockDom = {
        style: {},
        clientWidth: 1280,
        clientHeight: 800,
        ownerDocument: mockDoc,
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
        getRootNode: () => mockDoc,
        addEventListener: (type: string, fn: EventListener) => {
          let set = domListeners.get(type)
          if (!set) {
            set = new Set()
            domListeners.set(type, set)
          }
          set.add(fn)
        },
        removeEventListener: (type: string, fn: EventListener) => {
          domListeners.get(type)?.delete(fn)
        }
      } as unknown as HTMLElement

      const cam = new THREE.PerspectiveCamera(50, 1280 / 800, 0.5, 6000)
      cam.position.set(0, 40, 120)
      const rig = new CameraRig(cam, mockDom)

      // Inject genuine rotation + pan inertia
      emit(domListeners, 'pointerdown', {
        pointerId: 1,
        pointerType: 'mouse',
        button: 0,
        clientX: 400,
        clientY: 300
      })
      emit(docListeners, 'pointermove', {
        pointerId: 1,
        pointerType: 'mouse',
        clientX: 680,
        clientY: 420
      })
      rig.update(0.016)
      emit(docListeners, 'pointerup', { pointerId: 1, pointerType: 'mouse', button: 0 })

      emit(domListeners, 'pointerdown', {
        pointerId: 2,
        pointerType: 'mouse',
        button: 2,
        clientX: 500,
        clientY: 300
      })
      emit(docListeners, 'pointermove', {
        pointerId: 2,
        pointerType: 'mouse',
        clientX: 700,
        clientY: 450
      })
      rig.update(0.016)
      emit(docListeners, 'pointerup', { pointerId: 2, pointerType: 'mouse', button: 2 })

      return { cam, rig }
    }

    // Case A: Short animated flight (50ms) finishes in 1 update without overshooting goalPos/goalTarget
    const caseA = createRigWithInertia()
    const goalPosA = new THREE.Vector3(10, 25, 90)
    const goalTargetA = new THREE.Vector3(10, 5, 10)
    caseA.rig.flyTo(goalPosA, goalTargetA, { durationMs: 50 })
    caseA.rig.update(0.05)
    expect(caseA.rig.isFlying).toBe(false)
    expect(caseA.cam.position.distanceTo(goalPosA)).toBeLessThan(1e-4)
    expect(caseA.rig.controls.target.distanceTo(goalTargetA)).toBeLessThan(1e-4)
    caseA.rig.dispose()

    // Case B: Standard animated flight (750ms) has no frame-1 jump when cubic ease t is tiny
    const caseB = createRigWithInertia()
    const goalPosB = new THREE.Vector3(15, 30, 100)
    const goalTargetB = new THREE.Vector3(5, 0, 5)
    caseB.rig.flyTo(goalPosB, goalTargetB, { durationMs: 750 })
    const startPosB = caseB.cam.position.clone()
    caseB.rig.update(0.016)
    const frame1Jump = caseB.cam.position.distanceTo(startPosB)
    expect(frame1Jump).toBeLessThan(0.5)
    for (let i = 0; i < 10; i++) caseB.rig.update(0.08)
    expect(caseB.rig.isFlying).toBe(false)
    expect(caseB.cam.position.distanceTo(goalPosB)).toBeLessThan(1e-4)
    expect(caseB.rig.controls.target.distanceTo(goalTargetB)).toBeLessThan(1e-4)
    caseB.rig.dispose()
  })
})
