"use strict";

import { Vector3vl } from '3vl';
import { HeadlessCircuit } from 'digitaljs/src/circuit';
import { FengariRunner } from '../src/index.mjs';

const data = {
    devices: {
        i: {
            type: "Input",
            net: "i",
            bits: 1
        },
        o: {
            type: "Output",
            net: "o",
            bits: 1
        }
    },
    connectors: [
        {to: {id: "o", port: "in"}, from: {id: "i", port: "out"}}
    ],
    subcircuits: {}
};

const circuit = new HeadlessCircuit(data);
const runner = new FengariRunner(circuit);


test("setInput", () => {
    runner.run(`sim.setInput("i", vec.fromBool(true));`);
    expect(circuit.getOutput("o").isHigh).toBeTruthy();
    runner.run(`sim.setInput("i", vec.fromBool(false));`);
    expect(circuit.getOutput("o").isLow).toBeTruthy();
});

test("getOutput", () => {
    circuit.setInput("i", Vector3vl.zero);
    expect(runner.run3vl(`return sim.getOutput("o")`).isLow).toBeTruthy();
    circuit.setInput("i", Vector3vl.one);
    expect(runner.run3vl(`return sim.getOutput("o")`).isHigh).toBeTruthy();
});

test("tick", () => {
    expect(runner.runNumber(`return sim.tick()`)).toEqual(circuit.tick);
});

test("sleep 1", () => {
    const pid = runner.runThread(`sim.setInput("i", vec.fromBool(false)); sim.sleep(1); sim.setInput("i", vec.fromBool(true))`);
    expect(circuit.getOutput("o").isLow).toBeTruthy();
    expect(runner.isThreadRunning(pid)).toBeTruthy();
    circuit.updateGates();
    expect(circuit.getOutput("o").isHigh).toBeTruthy();
    expect(runner.isThreadRunning(pid)).toBeFalsy();
});

test("sleep 2", () => {
    const pid = runner.runThread(`sim.setInput("i", vec.fromBool(false)); sim.sleep(2); sim.setInput("i", vec.fromBool(true))`);
    expect(circuit.getOutput("o").isLow).toBeTruthy();
    expect(runner.isThreadRunning(pid)).toBeTruthy();
    circuit.updateGates();
    expect(circuit.getOutput("o").isLow).toBeTruthy();
    expect(runner.isThreadRunning(pid)).toBeTruthy();
    circuit.updateGates();
    expect(circuit.getOutput("o").isHigh).toBeTruthy();
    expect(runner.isThreadRunning(pid)).toBeFalsy();
});

test("stopThread", () => {
    const pid = runner.runThread(`sim.setInput("i", vec.fromBool(false)); sim.sleep(1); sim.setInput("i", vec.fromBool(true))`);
    expect(circuit.getOutput("o").isLow).toBeTruthy();
    expect(runner.isThreadRunning(pid)).toBeTruthy();
    runner.stopThread(pid);
    expect(runner.isThreadRunning(pid)).toBeFalsy();
    circuit.updateGates();
    expect(circuit.getOutput("o").isLow).toBeTruthy();
    expect(runner.isThreadRunning(pid)).toBeFalsy();
});

