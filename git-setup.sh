#!/bin/bash

# Add the script files to Git
git add fix-github-auth.sh setup-github-ssh.sh

# Commit the changes
git commit -m "Add GitHub authentication scripts"

echo "Script files have been committed to Git."
echo "To push to GitHub, run: git push -u origin main"

echo ""
echo "=== SSH Key Passphrase Information ==="
echo "You've set up an SSH key with a passphrase."
echo "Make sure to remember this passphrase - you'll need it when:"
echo "  - Pushing to GitHub"
echo "  - Pulling from GitHub" 
echo "  - Any other Git operations that communicate with the remote server"
echo ""
echo "If you need to change your passphrase later, run:"
echo "ssh-keygen -p -f ~/.ssh/id_ed25519"
echo ""
echo "Tip: Consider using ssh-agent to avoid typing the passphrase repeatedly:"
echo "eval \$(ssh-agent -s)"
echo "ssh-add ~/.ssh/id_ed25519"
