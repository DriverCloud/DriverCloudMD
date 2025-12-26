
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

function ExampleComponent() {
    return <div>Hello Testing World</div>
}

describe('Example Test', () => {
    it('should pass basic math', () => {
        expect(1 + 1).toBe(2)
    })

    it('should render component', () => {
        render(<ExampleComponent />)
        expect(screen.getByText('Hello Testing World')).toBeInTheDocument()
    })
})
