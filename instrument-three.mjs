#!/usr/bin/env node

import {promises as fs} from 'fs'
import path from 'path'
import * as walker from 'at-at'

// const functionHeader = /(function|\n)[ \t]*\w*\s*\(.*?\)\s*{/g
const functionHeader =
	/((function|\n)[ \t]*((?!(constructor))\w)*\s*\(.*?\)\s*{)|(\n[ \t]*(constructor)\s*?\(.*?\)\s*?{((?!constructor)\S|\s)*?(\bsuper)\(.*\);?)|(\n[ \t]*(constructor)\s*\(.*?\)\s*{(\S|\s)*?)/g

/**
 * @param {string} folder
 * @param {RegExp} filterPattern
 */
function instrument(folder, filterPattern) {
	walker.walk(folder, (/** @type {string[]} */ files) => {
		for (const file of files) {
			if (!file.match(filterPattern)) continue

			~(async function () {
				let code = await fs.readFile(file, {encoding: 'utf8'})

				// code = code.replace('"use strict"', '')
				// code = code.replace("'use strict'", '')

				code = code.replace(functionHeader, match => {
					// Don't instrument switch statements, for now.
					if (match.includes('switch')) return match
					// Skip if statements for now, because they might match within shader code.
					if (match.includes('if (')) return match
					// Skip for statements for now, because they might match within shader code.
					if (match.includes('for (')) return match

					// TODO a better way to do this would be via AST

					const matchEscaped = match.replaceAll('`', '\\`')

					return /*js*/ `${match}
						if (!window.executionResult) window.executionResult = []

						const Class = this && this.constructor

						// "for () {", "while () {", and "if () {", "catch () {" look like methods
						if (\`${matchEscaped.trim()}\`.includes('for') || \`${matchEscaped.trim()}\`.includes('while') || \`${matchEscaped.trim()}\`.includes('if') || \`${matchEscaped.trim()}\`.includes('catch')) {
							if (Class) {
								window.executionResult.push('block inside class method:' + Class.name + '#' + \`${matchEscaped.trim()}\`)
							} else {
								window.executionResult.push('block inside plain function:' + \`${matchEscaped.trim()}\`)
							}
						}
						// Otherwise we have a method or function
						else {
							if (Class) {
								window.executionResult.push('class method:' + Class.name + '#' + \`${matchEscaped.trim()}\`)
							} else {
								window.executionResult.push('plain function:' + \`${matchEscaped.trim()}\`)
							}
                        } 
					`
				})

				await fs.writeFile(file, code, {encoding: 'utf8'})
			})()
		}
	})
}

function modulePath(...modPath) {
	return path.resolve(process.cwd(), 'node_modules', ...modPath)
}

instrument(modulePath('three', 'build'), /.js$/)

// then `npm run build`, and in console you can take a look at `window.usedClasses`.
