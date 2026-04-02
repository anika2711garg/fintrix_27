# generate_jwt_secret.py
import secrets

def main():
    # 64 bytes of randomness, URL-safe text
    jwt_secret = secrets.token_urlsafe(64)
    print("JWT_SECRET=" + jwt_secret)

if __name__ == "__main__":
    main()