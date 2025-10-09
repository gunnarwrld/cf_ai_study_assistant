# 🤝 Contributing to AI Study Assistant

Thank you for your interest in contributing to the AI Study Assistant project! This document provides guidelines for contributing.

## 🎯 Ways to Contribute

- **Bug Reports**: Found a bug? Let us know!
- **Feature Requests**: Have an idea? Share it!
- **Code Contributions**: Submit pull requests
- **Documentation**: Improve docs and examples
- **Testing**: Help test new features
- **Examples**: Add more prompt examples

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cf-ai-study-assistant.git
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Setting Up Local Environment

1. Install dependencies: `npm install`
2. Login to Cloudflare: `wrangler login`
3. Start development server: `npm run dev`
4. Make your changes
5. Test thoroughly

### Code Style

- Use ES6+ features
- Follow existing code formatting
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

### Testing Your Changes

Before submitting:

- [ ] Test locally with `npm run dev`
- [ ] Verify all endpoints work
- [ ] Test WebSocket connections
- [ ] Check browser console for errors
- [ ] Test on mobile (if UI changes)
- [ ] Update documentation if needed

## 📝 Commit Guidelines

Use clear, descriptive commit messages:

```
feat: add voice input support
fix: resolve WebSocket reconnection issue
docs: update deployment instructions
style: improve chat UI responsiveness
refactor: optimize AI prompt handling
```

**Prefix types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: UI/styling changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

## 🔧 Pull Request Process

1. **Update your fork**

   ```bash
   git fetch upstream
   git merge upstream/main
   ```

2. **Push your changes**

   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**

   - Go to GitHub and create a PR
   - Fill out the PR template
   - Link related issues
   - Describe your changes clearly

4. **Code Review**

   - Address review comments
   - Update code as needed
   - Keep discussion professional

5. **Merge**
   - Once approved, PR will be merged
   - Your contribution will be live!

## 🐛 Reporting Bugs

### Before Submitting

- Check if bug already reported
- Test on latest version
- Collect relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.0.0]
- Wrangler version: [e.g., 3.80.0]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives**
Any alternative solutions you've considered.

**Additional context**
Any other context or screenshots.
```

## 📚 Documentation Contributions

Documentation is just as important as code!

**Ways to help:**

- Fix typos
- Improve clarity
- Add examples
- Update outdated info
- Translate to other languages

## 🎨 UI/UX Improvements

- Keep design consistent
- Maintain responsiveness
- Follow accessibility guidelines
- Test on multiple devices
- Consider dark mode support

## 🔒 Security Issues

**Do NOT** create public issues for security vulnerabilities.

Instead:

- Email directly (if email provided)
- Use GitHub Security Advisories
- Describe the vulnerability clearly
- Give time for fix before disclosure

## 📋 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome diverse perspectives
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy

### Not Acceptable

- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing others' private information
- Other unprofessional conduct

## 🏆 Recognition

Contributors will be:

- Listed in README.md
- Mentioned in release notes
- Credited in documentation

## 📞 Questions?

- Check existing documentation
- Search closed issues
- Open a discussion
- Ask in pull request

## 🎓 Learning Resources

### Cloudflare

- [Workers Docs](https://developers.cloudflare.com/workers/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)

### JavaScript

- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)

### Git & GitHub

- [Git Handbook](https://guides.github.com/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## 🚀 Deployment

After your PR is merged:

1. Changes will be reviewed
2. Tested in staging
3. Deployed to production
4. Announced in releases

## 📊 Project Structure

```
cf-ai-study-assistant/
├── worker/           # Backend code
├── frontend/         # UI code
├── docs/            # Documentation (if added)
└── tests/           # Tests (if added)
```

## ✅ Checklist Before Submitting

- [ ] Code follows project style
- [ ] Tested locally
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No sensitive data in code
- [ ] PR description is complete
- [ ] Ready for review!

---

## 🙏 Thank You!

Every contribution makes this project better. Whether you're fixing a typo or adding a major feature, your help is appreciated!
