import {createNoise2D} from 'simplex-noise'

import Clib from './clib.simple.js'
import {MAX_POWER, MIN_POWER} from './const.js'
import {clamp} from './library.js'

export default class ClibAdvanced extends Clib {
    simplex = createNoise2D()
    descriptor = {
        current: 0,
        target: 0,
        lastTarget: 0,
        blendTicks: 0,
    }

    roughness = 0
    range = 0

    public setDescriptor(desc: Partial<Record<'targetPower' | 'roughness' | 'range', number>>): void {
        const {range, roughness, targetPower} = desc
        const {descriptor} = this
        let updateBlendDuration = false
        if (targetPower && targetPower !== descriptor.target) {
            updateBlendDuration = true
            descriptor.target = clamp(targetPower, MIN_POWER, MAX_POWER)
        }
        if (roughness) {
            updateBlendDuration = true
            this.roughness = clamp(roughness, 0, 1)
        }
        if (range) {
            this.range = clamp(range, 0, 1)
        }
        if (updateBlendDuration) {
            const {current, target} = descriptor
            descriptor.lastTarget = current
            descriptor.blendTicks = Math.abs(target - current)
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private async tick(): Promise<void> {
        // this.updateCurrentPowerTarget()
        const value = this.getNextValue()
        await this.setPower(value)
    }

    private getNextValue(): number {
        if (this.range === 0) {
            return this.descriptor.current
        }

        const delta = (this.simplex(0, this.roughness) - 0.5) * this.range * MAX_POWER
        return clamp(this.descriptor.current + delta, MIN_POWER, MAX_POWER)
    }
}
