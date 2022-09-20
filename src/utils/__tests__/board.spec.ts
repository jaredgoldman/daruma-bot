import { createCell, replaceAt, createWhitespace } from '../boardUtils'
import { Alignment } from '../boardUtils'

describe('Create cell test utils', () => {
  it('creates a whitespace if fed no params', () => {
    expect(createCell(5).length === 5).toBeTruthy()
  })

  it('respects alignment paramater', () => {
    expect(createCell(5, Alignment.left, 'r')).toBe('r    ')
    expect(createCell(5, Alignment.right, 'r')).toBe('    r')
    expect(createCell(5, Alignment.centered, 'r')).toBe('  r  ')
  })

  it('handles multiple characters correctly', () => {
    expect(createCell(5, Alignment.left, 'rr')).toBe('rr   ')
    expect(createCell(5, Alignment.right, 'rr')).toBe('   rr')
    expect(createCell(5, Alignment.centered, 'rr')).toBe(' rr  ')
    expect(createCell(12, Alignment.centered, 'r')).toBe(`      r     `)
  })
})

describe('Whitespace generator test suite', () => {
  it('creates passed whitespace', () => {
    expect(createWhitespace(5).length === 5).toBeTruthy()
  })
})

describe('ReplaceAt test suite', () => {
  it('replaces at index', () => {
    expect(replaceAt(0, 'r', '     ')).toEqual('r    ')
    expect(replaceAt(1, 'r', '     ')).toEqual(' r   ')
    expect(replaceAt(2, 'r', '     ')).toEqual('  r  ')
    expect(replaceAt(3, 'r', '     ')).toEqual('   r ')
    expect(replaceAt(4, 'r', '     ')).toEqual('    r')
  })
})
