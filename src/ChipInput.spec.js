/* eslint-env jest */
import React from 'react'
import { mount } from 'enzyme'
import ChipInput from './ChipInput'

describe('uncontrolled mode', () => {
  it('matches the snapshot', () => {
    const tree = mount(
      <ChipInput defaultValue={['foo', 'bar']} />
    )
    expect(tree).toMatchSnapshot()
  })

  it('displays the default value in chips', () => {
    const tree = mount(
      <ChipInput defaultValue={['foo', 'bar', 'foobar']} />
    )
    expect(tree.find('Chip').map((chip) => chip.text())).toEqual(['foo', 'bar', 'foobar'])
  })

  it('displays added chips', () => {
    const tree = mount(
      <ChipInput defaultValue={['foo', 'bar']} />
    )
    tree.find('input').getDOMNode().value = 'test'
    tree.find('input').simulate('keyDown', { keyCode: 13 }) // press enter
    expect(tree.find('Chip').map((chip) => chip.text())).toEqual(['foo', 'bar', 'test'])
  })

  it('calls onChange when adding new chips', () => {
    const handleChange = jest.fn()
    const tree = mount(
      <ChipInput onChange={handleChange} />
    )

    tree.find('input').getDOMNode().value = 'foo'
    tree.find('input').simulate('keyDown', { keyCode: 13 }) // press enter
    expect(handleChange).toBeCalledWith(['foo'])

    tree.find('input').getDOMNode().value = 'bar'
    tree.find('input').simulate('keyDown', { keyCode: 13 }) // press enter
    expect(handleChange).toBeCalledWith(['foo', 'bar'])
  })

  it('calls onChange when deleting chips with backspace key', () => {
    const handleChange = jest.fn()
    const tree = mount(
      <ChipInput defaultValue={['foo', 'bar']} onChange={handleChange} />
    )

    tree.find('input').simulate('keyDown', { keyCode: 8 }) // backspace (to focus the chip)
    tree.find('input').simulate('keyDown', { keyCode: 8 }) // backspace (to remove the chip)
    expect(handleChange).toBeCalledWith(['foo'])
  })

  it('calls onChange when deleting chips with delete key', () => {
    const handleChange = jest.fn()
    const tree = mount(
      <ChipInput defaultValue={['foo', 'bar']} onChange={handleChange} />
    )

    tree.find('input').simulate('keyDown', { keyCode: 8 }) // backspace (to focus the chip)
    tree.find('input').simulate('keyDown', { keyCode: 46 }) // del (to remove the chip)
    expect(handleChange).toBeCalledWith(['foo'])
  })

  it('calls onChange when deleting chips by clicking on the remove button', () => {
    const handleChange = jest.fn()
    const tree = mount(
      <ChipInput defaultValue={['foo', 'bar']} onChange={handleChange} />
    )
    tree.find('Cancel').first().simulate('click')
    expect(handleChange).toBeCalledWith(['bar'])
  })
})

describe('chip focusing', () => {
  function getFocusedChip (tree) {
    return tree.find('Chip').filterWhere((chip) => chip.getDOMNode().style.backgroundColor !== '')
  }

  function focusChip (tree, name) {
    tree.find('Chip').filterWhere((chip) => chip.text() === name).simulate('click')
  }

  it('focuses a chip on click', () => {
    const tree = mount(
      <ChipInput defaultValue={['foo', 'bar']} />
    )
    tree.find('Chip').at(1).simulate('click')
    expect(getFocusedChip(tree).length).toBe(1)
    expect(getFocusedChip(tree).text()).toBe('bar')
  })

  it('focuses the last chip when pressing backspace', () => {
    const tree = mount(
      <ChipInput defaultValue={['a', 'b', 'c']} />
    )
    tree.find('input').simulate('keyDown', { keyCode: 8 }) // backspace
    expect(getFocusedChip(tree).text()).toBe('c')
  })

  it('unfocuses the focused chip while adding a new chip', () => {
    const tree = mount(
      <ChipInput defaultValue={['foo', 'bar']} />
    )
    focusChip(tree, 'foo')
    tree.find('input').simulate('keyDown')
    expect(getFocusedChip(tree).length).toBe(0)
  })

  it('unfocuses the focused chip on blur', () => {
    const tree = mount(
      <ChipInput defaultValue={['foo', 'bar']} />
    )
    focusChip(tree, 'foo')
    tree.find('input').simulate('blur')
    expect(getFocusedChip(tree).length).toBe(0)
  })

  it('unfocuses the focused chip when switching to disabled state', () => {
    const tree = mount(
      <ChipInput defaultValue={['foo', 'bar']} />
    )
    focusChip(tree, 'foo')
    tree.setProps({ disabled: true })
    expect(getFocusedChip(tree).length).toBe(0)
  })

  it('moves the focus to the left when pressing the left arrow key', () => {
    const tree = mount(
      <ChipInput defaultValue={['a', 'b', 'c']} />
    )
    focusChip(tree, 'b')
    tree.find('input').simulate('keyDown', { keyCode: 37 }) // arrow left
    expect(getFocusedChip(tree).text()).toBe('a')

    // keep the first element focused when pressing left if the first element is already focused
    tree.find('input').simulate('keyDown', { keyCode: 37 }) // arrow left
    expect(getFocusedChip(tree).text()).toBe('a')
  })

  it('moves the focus to the right when pressing the right arrow key', () => {
    const tree = mount(
      <ChipInput defaultValue={['a', 'b', 'c']} />
    )
    focusChip(tree, 'b')
    tree.find('input').simulate('keyDown', { keyCode: 39 }) // arrow right
    expect(getFocusedChip(tree).text()).toBe('c')

    // onfocus all chips if the right arrow key is pressed when focusing the last chip
    tree.find('input').simulate('keyDown', { keyCode: 39 }) // arrow right
    expect(getFocusedChip(tree).length).toBe(0)
  })

  it('focuses the chip to the left when removing a chip by pressing backspace', () => {
    const tree = mount(
      <ChipInput defaultValue={['a', 'b', 'c']} />
    )
    focusChip(tree, 'b')

    tree.find('input').simulate('keyDown', { keyCode: 8 }) // backspace
    expect(getFocusedChip(tree).text()).toBe('a')
  })

  it('focuses the chip at the previously focused position when removing a chip by pressing delete', () => {
    const tree = mount(
      <ChipInput defaultValue={['a', 'b', 'c']} />
    )
    focusChip(tree, 'b')

    tree.find('input').simulate('keyDown', { keyCode: 46 }) // delete
    expect(getFocusedChip(tree).text()).toBe('c')
  })
})

describe('placeholder', () => {
  it('displays a placeholder', () => {
    const tree = mount(
      <ChipInput placeholder='Placeholder' />
    )

    expect(tree.find('input').getDOMNode().getAttribute('placeholder')).toBe('Placeholder')
  })

  it('is hidden if there are chips', () => {
    const tree = mount(
      <ChipInput placeholder='Placeholder' value={['foo']} />
    )

    expect(tree.find('input').getDOMNode().getAttribute('placeholder')).toBe(null)
  })

  it('is hidden if there is a floating label', () => {
    const tree = mount(
      <ChipInput placeholder='Placeholder' label='Floating label' />
    )

    expect(tree.find('input').getDOMNode().getAttribute('placeholder')).toBe(null)
  })

  it('is visible if the floating label is floating', () => {
    const tree = mount(
      <ChipInput placeholder='Placeholder' label='Floating label' />
    )
    tree.find('input').simulate('focus')
    expect(tree.find('InputLabel').prop('shrink')).toBe(true)
    expect(tree.find('input').getDOMNode().getAttribute('placeholder')).toBe('Placeholder')
  })
})

describe('floating label', () => {
  it('is displayed', () => {
    const tree = mount(
      <ChipInput label='Floating label' />
    )
    expect(tree.find('InputLabel').text()).toBe('Floating label')
    expect(tree.find('InputLabel').prop('shrink')).toBe(false)
  })

  it('shrinks if there are chips', () => {
    const tree = mount(
      <ChipInput label='Floating label' value={['foo']} />
    )
    expect(tree.find('InputLabel').prop('shrink')).toBe(true)
  })

  it('shrinks if there are no chips but text input', () => {
    const tree = mount(
      <ChipInput label='Floating label' />
    )
    tree.find('input').getDOMNode().value = 'foo'
    tree.find('input').simulate('change')
    expect(tree.find('InputLabel').prop('shrink')).toBe(true)
  })
})
