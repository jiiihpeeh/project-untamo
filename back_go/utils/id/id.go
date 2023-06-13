package id

import "go.mongodb.org/mongo-driver/bson/primitive"

func GenerateId() primitive.ObjectID {
	primitive.NewObjectID()

	return primitive.NewObjectID()
}

func IdFromString(id string) primitive.ObjectID {
	idPrimitive, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return GenerateId()
	}
	return idPrimitive
}
