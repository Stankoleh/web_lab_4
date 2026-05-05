import re
from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'email', 'role', 'password']

    def get_role(self, obj):
        return 'admin' if obj.is_staff or obj.is_superuser else 'regular'

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def validate_username(self, value):
        value = value.strip().replace(' ', '_')
        if not value:
            raise serializers.ValidationError('Username не може бути порожнім.')
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError('Username може містити лише літери, цифри та символи @/./+/-/_.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', '1234')
        role = self.initial_data.get('role', 'regular')
        user = User(**validated_data)
        user.is_staff = role == 'admin'
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        role = self.initial_data.get('role')
        for key, value in validated_data.items():
            setattr(instance, key, value)
        if role is not None:
            instance.is_staff = role == 'admin'
        if password:
            instance.set_password(password)
        instance.save()
        return instance
