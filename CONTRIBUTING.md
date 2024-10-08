# Contributing to AstralSeed

Thank you for your interest in contributing to AstralSeed! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)

### Suggesting Enhancements

We welcome suggestions for new features or improvements:
- Check if the suggestion already exists in issues
- Provide clear use cases and examples
- Explain why this enhancement would be useful

### Pull Requests

1. **Fork the repository**
2. **Create a branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow the coding standards below
   - Add tests for new functionality
   - Update documentation as needed
4. **Test your changes**
   ```bash
   npm run test
   npm run compile
   ```
5. **Commit your changes**
   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     - `feat:` for new features
     - `fix:` for bug fixes
     - `docs:` for documentation
     - `test:` for tests
     - `refactor:` for refactoring
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**
   - Provide a clear description
   - Reference related issues
   - Wait for review and address feedback

## Coding Standards

### Solidity

- Follow Solidity style guide
- Use NatSpec comments for all public functions
- Keep functions small and focused
- Use meaningful variable names
- Add appropriate access modifiers
- Include comprehensive error messages

Example:
```solidity
/**
 * @notice Register a new institution
 * @param pubkey The institution's public key address
 * @param name The institution name
 * @return institutionId The assigned institution ID
 */
function registerInstitution(
    address pubkey,
    string memory name
) external onlyRole(REGISTRAR_ROLE) returns (uint256) {
    require(pubkey != address(0), "Invalid pubkey");
    // Implementation
}
```

### JavaScript/TypeScript

- Use ES6+ features
- Follow ESLint configuration
- Add JSDoc comments for functions
- Use async/await over callbacks
- Handle errors appropriately

### Testing

- Write tests for all new features
- Aim for high test coverage
- Use descriptive test names
- Test both success and failure cases
- Include edge cases

Example:
```javascript
describe("Feature", function () {
  it("Should perform expected behavior", async function () {
    // Test implementation
  });

  it("Should fail with invalid input", async function () {
    await expect(contract.function()).to.be.revertedWith("Error message");
  });
});
```

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adolph-Hughes/AstralSeed.git
   cd AstralSeed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

4. **Run tests**
   ```bash
   npm run test
   ```

5. **Compile contracts**
   ```bash
   npm run compile
   ```

## Project Structure

```
AstralSeed/
├── contracts/          # Solidity contracts
│   ├── interfaces/    # Contract interfaces
│   └── *.sol          # Implementation contracts
├── test/              # Test files
├── scripts/           # Deployment and utility scripts
├── docs/              # Additional documentation
└── hardhat.config.js  # Hardhat configuration
```

## Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities. Instead:
- Email security concerns to the maintainers
- Provide detailed description and reproduction steps
- Allow time for fixes before public disclosure

### Security Best Practices

- Never commit private keys or secrets
- Use `.env` for sensitive configuration
- Review code carefully before committing
- Run security analysis tools
- Follow smart contract security best practices

## Questions?

If you have questions:
- Check existing issues and discussions
- Review the documentation
- Create a new issue with the "question" label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to AstralSeed! 🚀

